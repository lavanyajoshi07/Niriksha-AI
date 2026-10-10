'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Shield, Upload, MapPin, CheckCircle2, AlertTriangle, 
  Cpu, Search, ArrowRight, Camera, FileText, User
} from 'lucide-react';
import { InfrastructureCategory, LocationData, AIScreeningResult } from '@/types';
import { DuplicateMatchResult } from '@/lib/duplicate-detector';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading GIS Map Picker...
    </div>
  ),
});

export default function SubmitReportPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<InfrastructureCategory>('pothole');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Outer Ring Road, Kadubeesanahalli, Bengaluru');
  const [landmark, setLandmark] = useState('Near JP Morgan Campus');
  const [latitude, setLatitude] = useState(12.9569);
  const [longitude, setLongitude] = useState(77.7011);
  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [citizenPhone, setCitizenPhone] = useState('+91 98765 43210');
  const [citizenEmail, setCitizenEmail] = useState('citizen@sentinel.in');
  const [consentGiven, setConsentGiven] = useState(true);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800'
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Workflow states
  const [submitting, setSubmitting] = useState(false);
  const [aiScreeningResult, setAiScreeningResult] = useState<AIScreeningResult | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatchResult[]>([]);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setPhotoPreview(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Bengaluru Zone`);
  };

  const setPresetLocation = (name: string, lat: number, lng: number, add: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(add);
  };

  const handleSubmit = async (e: React.FormEvent, forceDuplicateLinkId?: string) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the complaint title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        description,
        location: {
          latitude,
          longitude,
          address,
          landmark,
          city: 'Bengaluru',
          zone: 'Mahadevapura',
        },
        evidence: [
          {
            id: `ev-${Date.now()}`,
            type: 'before_photo',
            url: photoPreview,
            filename: 'damage_photo.jpg',
            timestamp: new Date().toISOString(),
            uploadedBy: citizenName || 'Citizen',
          },
        ],
        citizenContact: {
          name: citizenName,
          phone: citizenPhone,
          email: citizenEmail,
        },
        consentGiven,
        forceDuplicateLinkId,
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setAiScreeningResult(data.aiScreening);
        if (data.duplicateMatches && data.duplicateMatches.length > 0 && !forceDuplicateLinkId) {
          setDuplicateMatches(data.duplicateMatches);
        } else {
          setSubmittedData(data);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Success Confirmation View
  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 w-full">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase bg-teal-950 text-teal-400 border border-teal-800 px-3 py-1 rounded-full">
                Complaint Registered
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-3">
                Report Submitted Successfully
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Your report has been received and indexed into the Bharat Sentinel AI dispatch queue.
              </p>
            </div>

            {/* Complaint Key Details Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 font-medium">Complaint Tracking ID:</span>
                <span className="text-base font-extrabold font-mono text-sky-400">
                  {submittedData.complaintId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-200 capitalize">{submittedData.report.category.replace('_', ' ')}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-slate-200 truncate block">{submittedData.report.location.address}</span>
                </div>
              </div>

              {/* AI Screening Result Badge */}
              {submittedData.aiScreening && (
                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>AI Vision Severity Score</span>
                    </span>
                    <span className="text-[10px] bg-sky-900 text-sky-300 font-mono px-2 py-0.5 rounded">
                      {submittedData.aiScreening.confidenceScore}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {submittedData.aiScreening.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/track/${submittedData.complaintId}`}
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors text-center"
              >
                Track Status & Live Updates &rarr;
              </Link>
              <button
                onClick={() => {
                  setSubmittedData(null);
                  setTitle('');
                  setDescription('');
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Submit Another Issue
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-sky-800/60">
            <Shield className="w-3.5 h-3.5" />
            <span>Public Incident Intake</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Report an Infrastructure Problem
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit damage reports for potholes, waterlogging, or blocked drains. AI vision automatically screens severity and dispatches field inspectors.
          </p>
        </div>

        {/* Duplicate Warning Modal / Overlay */}
        {duplicateMatches.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Possible Duplicate Incident Detected Near This Location</span>
            </div>

            <p className="text-xs text-slate-300">
              Bharat Sentinel AI detected active reported incidents near your coordinates matching your category:
            </p>

            <div className="space-y-2">
              {duplicateMatches.map((m) => (
                <div key={m.incident.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white font-mono">{m.incident.incidentNumber}</span>
                    <span className="text-slate-400 ml-2">&bull; {m.distanceMeters}m away</span>
                    <p className="text-[11px] text-slate-300 mt-0.5">{m.incident.title}</p>
                  </div>
                  <button
                    onClick={(e) => handleSubmit(e, m.incident.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shrink-0"
                  >
                    Link to This Incident
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-900/60 text-xs">
              <span className="text-slate-400">Prefer to submit as a new individual incident?</span>
              <button
                onClick={(e) => {
                  setDuplicateMatches([]);
                  handleSubmit(e, 'FORCE_NEW');
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Proceed as New Incident
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
          
          {/* Section 1: Complaint Basic Details */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>1. Complaint Category & Description</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Infrastructure Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InfrastructureCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="pothole">Pothole / Road Surface Crater</option>
                <option value="road_crack">Road Asphalt Structural Crack</option>
                <option value="damaged_road">Damaged Pavement / Loose Gravel</option>
                <option value="blocked_drain">Blocked Stormwater Drain / Culvert</option>
                <option value="waterlogging">Severe Monsoon Waterlogging</option>
                <option value="damaged_public_infrastructure">Damaged Footpath / Median</option>
                <option value="bridge_structural">Bridge / Flyover Structural Stress</option>
                <option value="street_lighting">Faulty Streetlight Grid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Complaint Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous deep pothole on fast lane of Outer Ring Road"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Detailed Observation
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the depth, size, hazard risk, or traffic impact..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Section 2: Damage Photo Evidence & AI Vision Screening */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>2. Damage Photograph & AI Vision Screening</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Upload Damage Photo
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-sky-500 transition-colors relative bg-slate-950/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-sky-400 block">Click or Drag Photo Here</span>
                  <span className="text-[10px] text-slate-500 block mt-1">JPEG, PNG up to 10MB</span>
                </div>
              </div>

              {/* Photo Preview */}
              <div>
                <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Photo Evidence Preview
                </span>
                <div className="h-44 rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950">
                  <img
                    src={photoPreview}
                    alt="Damage Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-sky-400 font-mono border border-slate-800 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>AI Vision Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location Selection */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>3. GIS Map Pin & Landmark</span>
            </h2>

            {/* Quick Preset Location Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Demo Coordinates:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPresetLocation('Outer Ring Road', 12.9569, 77.7011, 'Outer Ring Road, Kadubeesanahalli, Bengaluru')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 font-mono"
                >
                  Outer Ring Road (12.9569, 77.7011)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetLocation('Indiranagar 100ft Rd', 12.9719, 77.6412, '100 Feet Road, Indiranagar 2nd Stage, Bengaluru')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 font-mono"
                >
                  Indiranagar 100ft Rd (12.9719, 77.6412)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetLocation('Silk Board', 12.9172, 77.6228, 'Silk Board Junction, Hosur Road, Bengaluru')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500 text-slate-300 font-mono"
                >
                  Silk Board Junction (12.9172, 77.6228)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Address / Street</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Click Map to Adjust Pin Coordinates ({latitude.toFixed(4)}, {longitude.toFixed(4)})
              </span>
              <MapComponent
                selectedLocation={{ latitude, longitude, address, city: 'Bengaluru' }}
                onSelectLocation={handleMapLocationSelect}
                interactiveSelect={true}
                height="260px"
                zoom={13}
              />
            </div>
          </div>

          {/* Section 4: Citizen Contact & Consent */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-sky-400" />
              <span>4. Contact Details & Submission Verification</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-950"
              />
              <label htmlFor="consent" className="text-xs text-slate-300">
                I confirm that the submitted photo and location information accurately reflect public infrastructure damage observed.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !consentGiven}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Running AI Screening & Dispatching...</span>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Submit Complaint to Bharat Sentinel AI</span>
              </>
            )}
          </button>

        </form>
      </main>
    </div>
  );
}
