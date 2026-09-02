import { useEffect, useState } from 'react';
import {
  getMyFreelancerProfile,
  updateFreelancerProfile,
  getMyClientProfile,
  updateClientProfile
} from '../services/profile-service';
import { uploadToCloudinary } from '../services/upload-service';

const ProfileEditorPage = ({ user }) => {
  const isFreelancer = user?.role === 'freelancer';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [freelancerData, setFreelancerData] = useState({
    headline: '',
    bio: '',
    hourlyRate: '',
    currency: 'USD',
    availability: 'full_time',
    skills: [],
    portfolio: []
  });
  const [skillInput, setSkillInput] = useState('');

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    link: '',
    imageUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  const [clientData, setClientData] = useState({
    companyName: '',
    isCompany: false,
    description: '',
    website: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isFreelancer) {
          const profile = await getMyFreelancerProfile();
          if (profile) {
            setFreelancerData({
              headline: profile.headline || '',
              bio: profile.bio || '',
              hourlyRate: profile.hourlyRate !== undefined ? profile.hourlyRate : '',
              currency: profile.currency || 'USD',
              availability: profile.availability || 'full_time',
              skills: Array.isArray(profile.skills) ? profile.skills : [],
              portfolio: Array.isArray(profile.portfolio) ? profile.portfolio : []
            });
          }
        } else {
          const profile = await getMyClientProfile();
          if (profile) {
            setClientData({
              companyName: profile.companyName || '',
              isCompany: Boolean(profile.isCompany),
              description: profile.description || '',
              website: profile.website || ''
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user, isFreelancer]);

  const handleFreelancerChange = (e) => {
    const { name, value } = e.target;
    setFreelancerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClientData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!freelancerData.skills.includes(trimmed)) {
      setFreelancerData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFreelancerData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleProjectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadRes = await uploadToCloudinary(file);
      setNewProject((prev) => ({ ...prev, imageUrl: uploadRes.url }));
    } catch (err) {
      alert('Failed to upload project preview image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    setFreelancerData((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, newProject]
    }));
    setNewProject({ title: '', description: '', link: '', imageUrl: '' });
    setShowPortfolioForm(false);
  };

  const handleRemoveProject = (indexToRemove) => {
    setFreelancerData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (isFreelancer) {
        await updateFreelancerProfile({
          headline: freelancerData.headline,
          bio: freelancerData.bio,
          hourlyRate: Number(freelancerData.hourlyRate),
          currency: freelancerData.currency,
          availability: freelancerData.availability,
          skills: freelancerData.skills,
          portfolio: freelancerData.portfolio
        });
      } else {
        await updateClientProfile({
          companyName: clientData.companyName,
          isCompany: clientData.isCompany,
          description: clientData.description,
          website: clientData.website
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-teal-600">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-cream-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink mb-1">
          {isFreelancer ? 'Edit Freelancer Profile' : 'Edit Client Profile'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isFreelancer
            ? 'Highlight your skills, rate, and experience for prospective clients.'
            : 'Share details about your company or individual client background.'}
        </p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded">Profile saved successfully!</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isFreelancer ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Professional Headline</label>
                <input
                  type="text"
                  name="headline"
                  placeholder="e.g. Senior Full-Stack MERN Developer"
                  value={freelancerData.headline}
                  onChange={handleFreelancerChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Bio / Overview</label>
                <textarea
                  name="bio"
                  rows="4"
                  placeholder="Describe your background, experience, and services..."
                  value={freelancerData.bio}
                  onChange={handleFreelancerChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={freelancerData.hourlyRate}
                    onChange={handleFreelancerChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">Availability</label>
                  <select
                    name="availability"
                    value={freelancerData.availability}
                    onChange={handleFreelancerChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type a skill and click Add (e.g. React, Node.js)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-cream-200 text-ink text-sm font-medium rounded-md hover:bg-cream-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {freelancerData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 bg-brand-teal text-white text-xs px-2.5 py-1 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-200 ml-1 text-sm font-bold leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-cream-200">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink">Portfolio Projects</h3>
                    <p className="text-xs text-gray-500">Showcase your completed projects and past work.</p>
                  </div>
                  {!showPortfolioForm && (
                    <button
                      type="button"
                      onClick={() => setShowPortfolioForm(true)}
                      className="text-xs font-semibold bg-accent-sand text-brand-teal px-3 py-1.5 rounded hover:bg-[#B8956B] cursor-pointer"
                    >
                      + Add Project
                    </button>
                  )}
                </div>

                {showPortfolioForm && (
                  <div className="bg-brand-cream/30 border border-cream-200 rounded-lg p-4 mb-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">New Portfolio Project</h4>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Project Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile E-Commerce Redesign"
                        value={newProject.title}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Project Description</label>
                      <textarea
                        rows="2"
                        placeholder="Brief summary of your contribution and tech stack..."
                        value={newProject.description}
                        onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Live Project Link (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={newProject.link}
                          onChange={(e) => setNewProject((prev) => ({ ...prev, link: e.target.value }))}
                          className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-brand-teal bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Project Preview Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProjectImageUpload}
                          disabled={uploadingImage}
                          className="text-xs"
                        />
                        {uploadingImage && <span className="text-xs text-brand-teal ml-1">Uploading...</span>}
                      </div>
                    </div>

                    {newProject.imageUrl && (
                      <img
                        src={newProject.imageUrl}
                        alt="Project Preview"
                        className="h-20 w-32 object-cover rounded border border-cream-200 mt-2"
                      />
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPortfolioForm(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddProject}
                        disabled={uploadingImage || !newProject.title.trim()}
                        className="px-3 py-1 text-xs bg-brand-teal text-white rounded font-medium disabled:opacity-50 cursor-pointer"
                      >
                        Add to Profile
                      </button>
                    </div>
                  </div>
                )}

                {freelancerData.portfolio.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No portfolio projects added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {freelancerData.portfolio.map((proj, idx) => (
                      <div key={idx} className="border border-cream-200 rounded p-3 bg-white relative flex flex-col justify-between shadow-xs">
                        <div>
                          {proj.imageUrl && (
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          )}
                          <h4 className="font-semibold text-sm text-ink">{proj.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{proj.description}</p>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-teal underline mt-1 inline-block"
                            >
                              Live Project ↗
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="text-xs text-red-500 hover:text-red-700 self-end mt-2 font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Acme Tech Solutions"
                  value={clientData.companyName}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCompany"
                  name="isCompany"
                  checked={clientData.isCompany}
                  onChange={handleClientChange}
                  className="rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                />
                <label htmlFor="isCompany" className="text-sm font-medium text-ink cursor-pointer">
                  This account represents a registered company
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://example.com"
                  value={clientData.website}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">About the Client / Company</label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe your company or hiring background..."
                  value={clientData.description}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-brand-teal"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-cream-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-teal hover:bg-teal-900 text-white font-medium px-6 py-2 rounded-md text-sm transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditorPage;