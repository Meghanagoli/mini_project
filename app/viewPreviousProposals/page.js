'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import Sidebar from '../client_sidebar/page';
export default function ViewPreviousProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('authToken'); 

    router.push('/'); //
  };
  

  useEffect(() => {
    const email = sessionStorage.getItem('email'); 
    console.log("proposals",email)
    fetch(`/api/propose_email/${email}`)
      .then(res => res.json())
      .then(data => {
        console.log("Proposals data:", data); 
        setProposals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch proposals:', err);
        setLoading(false);
      });
  }, []);

  const filteredProposals = proposals.filter((proposal) =>
    proposal.startupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (proposal) => {
    setEditingId(proposal._id);
    setFormValues({
      stage: proposal.stage,
      funding: proposal.funding,
      website: proposal.website,
      file: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      console.log(files)
      setFormValues(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };
  const[filePath,setFilePath]=useState("");
  const handleSave = async (id) => {
    const formData = new FormData();
    formData.append('stage', formValues.stage);
    formData.append('funding', formValues.funding);
    formData.append('website', formValues.website);
   
    if (formValues.file) {
      const uploadForm = new FormData();
      uploadForm.append('file', formValues.file);
    
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
    
      const uploadResult = await uploadRes.json();
      const tempFilePath = uploadResult.filePath;
    
      if (!uploadRes.ok || !tempFilePath) {
        alert('File upload failed.');
        return;
      }
    
      // Validate the file
      const validationRes = await fetch('/api/valid-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: tempFilePath }),
      });
    
      const validationResult = await validationRes.json();
    
      if (!validationResult.valid) {
        alert('Validation failed: ' + (validationResult.error || 'Invalid file'));
        return;
      }
    
      // If validation passes, add file to final formData
      formData.append('file', formValues.file);
    }
    
    
    try {
      const email = sessionStorage.getItem('email'); 
      const res = await fetch(`/api/propose/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        alert('Updated successfully!');
        setEditingId(null);
        const updated = await fetch(`/api/propose_email/${email}`).then(res => res.json());
        setProposals(updated);
      } else {
        console.error(result.error);
        alert('Failed to update.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred during update.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
     <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-4">Previous Startup Proposals</h1>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search Proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 shadow-md w-full"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredProposals.length === 0 ? (
          <p>No proposals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">Startup Name</th>
                  <th className="p-3 border-b">Industry</th>
                  <th className="p-3 border-b">Stage</th>
                  <th className="p-3 border-b">Funding</th>
                  <th className="p-3 border-b">Website</th>
                  <th className="p-3 border-b">File</th>
                  <th className="p-3 border-b">Actions</th>
                  <th className="p-3 border-b">Likes</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{proposal.startupName}</td>
                    <td className="p-3 border-b">{proposal.industry}</td>

                    <td className="p-3 border-b">
                      {editingId === proposal._id ? (
                        <select
                          name="stage"
                          value={formValues.stage}
                          onChange={handleChange}
                          className="border rounded p-1"
                        >
                          <option value="">Select Stage</option>
                          <option value="Idea">Idea</option>
                          <option value="Prototype">Prototype</option>
                          <option value="MVP">MVP</option>
                          <option value="Scaling">Scaling</option>
                          <option value="Revenue-Generating">Revenue-Generating</option>
                        </select>
                      ) : (
                        proposal.stage
                      )}
                    </td>

                    <td className="p-3 border-b">
                      {editingId === proposal._id ? (
                        <select
                          name="funding"
                          value={formValues.funding}
                          onChange={handleChange}
                          className="border rounded p-1"
                        >
                          <option value="">Select Funding</option>
                          <option value="None">None</option>
                          <option value="Seed">Seed</option>
                          <option value="Series A">Series A</option>
                          <option value="Series B+">Series B+</option>
                        </select>
                      ) : (
                        proposal.funding
                      )}
                    </td>

                    <td className="p-3 border-b">
                      {editingId === proposal._id ? (
                        <input
                          type="text"
                          name="website"
                          value={formValues.website}
                          onChange={handleChange}
                          className="border rounded p-1 w-full"
                        />
                      ) : proposal.website ? (
                        <a
                          href={proposal.website.startsWith('http') ? proposal.website : `https://${proposal.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-3 border-b">
                      {editingId === proposal._id ? (
                        <input type="file" name="file" onChange={handleChange} />
                      ) : proposal.file?.name ? (
                        <a
                          href={`/api/propose/${proposal._id}`}
                          target="_blank"
                          className="text-blue-500 underline"
                        >
                          View File
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-3 border-b">
                      {editingId === proposal._id ? (
                        <button
                          onClick={() => handleSave(proposal._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(proposal)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>

                    <td className="p-4 border-b flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      {proposal.likes ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
