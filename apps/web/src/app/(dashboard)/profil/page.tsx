'use client';

import { useState } from 'react';
import { Pencil, X, Check, ExternalLink, Video, Upload, Trash2, Globe, MapPin, User, Building2 } from 'lucide-react';
import { useCompanyProfile, useUpdateCompanyProfile } from '@/hooks/use-company-profile';
import { uploadCompanyPhotos, uploadCompanyVideo, deleteCompanyPhoto, deleteCompanyVideo } from '@/lib/upload';
import { SWISS_CANTONS } from '@lehrstellen/shared';
import type { CultureScores, CultureDealbreakers } from '@lehrstellen/shared';
import CultureProfileSection from '@/components/shared/culture-profile-section';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const INDUSTRIES = [
  'Technologie', 'Gesundheit', 'Finanzen', 'Bildung', 'Handel',
  'Handwerk', 'Industrie', 'Gastronomie', 'Bau', 'Andere',
];

const SIZE_OPTIONS = [
  { value: 'MICRO', label: '1-10 Mitarbeiter' },
  { value: 'SMALL', label: '11-50 Mitarbeiter' },
  { value: 'MEDIUM', label: '51-250 Mitarbeiter' },
  { value: 'LARGE', label: '250+ Mitarbeiter' },
];

const inputClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const selectClass = 'w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all';
const labelClass = 'mb-1.5 block text-[12px] font-medium text-text-secondary';

export default function ProfilPage() {
  const { data: profile, isLoading, refetch } = useCompanyProfile();
  const updateProfile = useUpdateCompanyProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [canton, setCanton] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonRole, setContactPersonRole] = useState('');
  const [address, setAddress] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [cultureScores, setCultureScores] = useState<Partial<CultureScores>>({});
  const [cultureDealbreakers, setCultureDealbreakers] = useState<Partial<CultureDealbreakers>>({});
  const [culturePresetId, setCulturePresetId] = useState<string | undefined>();

  const startEditing = () => {
    if (!profile) return;
    setCompanyName(profile.companyName);
    setDescription(profile.description || '');
    setIndustry(profile.industry);
    setCompanySize(profile.companySize);
    setCanton(profile.canton);
    setCity(profile.city);
    setWebsite(profile.website || '');
    setContactPersonName(profile.contactPersonName);
    setContactPersonRole(profile.contactPersonRole || '');
    setAddress(profile.address || '');
    setVideoUrl(profile.videoUrl || '');
    setLinks(profile.links.map((l) => ({ label: l.label, url: l.url })));
    setCultureScores(profile.cultureScores ?? {});
    setCultureDealbreakers(profile.cultureDealbreakers ?? {});
    setCulturePresetId(profile.culturePresetId);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(
      {
        companyName,
        description,
        industry,
        companySize,
        canton,
        city,
        website: website || undefined,
        contactPersonName,
        contactPersonRole: contactPersonRole || undefined,
        address: address || undefined,
        videoUrl: videoUrl || null,
        links,
        cultureScores,
        cultureDealbreakers,
        culturePresetId,
      },
      {
        onSuccess: () => {
          toast.success('Profil aktualisiert');
          setIsEditing(false);
        },
        onError: () => toast.error('Fehler beim Speichern'),
      },
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      await uploadCompanyPhotos(files);
      toast.success('Fotos hochgeladen');
      refetch();
    } catch {
      toast.error('Fehler beim Hochladen');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteCompanyPhoto(photoId);
      toast.success('Foto gelöscht');
      refetch();
    } catch {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadCompanyVideo(file);
      toast.success('Video hochgeladen');
      refetch();
    } catch {
      toast.error('Fehler beim Hochladen');
    }
  };

  const handleDeleteVideo = async () => {
    try {
      await deleteCompanyVideo();
      toast.success('Video gelöscht');
      refetch();
    } catch {
      toast.error('Fehler beim Löschen');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white p-14 text-center shadow-card">
        <p className="text-[14px] text-text-secondary">Profil nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            Firmenprofil
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Ihr öffentliches Unternehmensprofil
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl border border-border-light px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text transition-all duration-150"
          >
            <Pencil className="h-3.5 w-3.5" />
            Bearbeiten
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 rounded-xl border border-border-light px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-background transition-all duration-150"
            >
              <X className="h-3.5 w-3.5" />
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200"
            >
              <Check className="h-3.5 w-3.5" />
              Speichern
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Company Identity */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-bold text-xl">
              {profile.companyName[0]}
            </div>
            <div>
              {isEditing ? (
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-[18px] font-bold text-text rounded-lg border border-border-light bg-transparent px-2 py-0.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              ) : (
                <h2 className="text-[18px] font-bold text-text">{profile.companyName}</h2>
              )}
              <p className="text-[13px] text-text-secondary mt-0.5">
                {profile.industry} · {profile.canton}, {profile.city}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 pt-4 border-t border-border-light">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Branche</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectClass}>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Grösse</label>
                  <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={selectClass}>
                    {SIZE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kanton</label>
                  <select value={canton} onChange={(e) => setCanton(e.target.value)} className={selectClass}>
                    {SWISS_CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Stadt</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kontaktperson</label>
                  <input value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Rolle</label>
                  <input value={contactPersonRole} onChange={(e) => setContactPersonRole(e.target.value)} placeholder="z.B. HR-Leiterin" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Adresse</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Musterstrasse 1, 8000 Zürich" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {/* Video */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h3 className="text-[15px] font-semibold text-text mb-4">
            Video
          </h3>
          {profile.videoUrl ? (
            <div className="relative">
              <video
                src={profile.videoUrl}
                controls
                className="w-full rounded-xl bg-black"
              />
              {isEditing && (
                <button
                  onClick={handleDeleteVideo}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-error/90 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm hover:bg-error transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Löschen
                </button>
              )}
            </div>
          ) : isEditing ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-light py-10 text-text-tertiary hover:border-primary hover:text-primary transition-all duration-150">
              <Upload className="h-7 w-7" />
              <span className="text-[13px] font-medium">Video hochladen</span>
              <span className="text-[11px]">Max. 50 MB</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-background py-8 text-text-tertiary">
              <Video className="h-7 w-7" />
              <p className="text-[13px]">Kein Video vorhanden</p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h3 className="text-[15px] font-semibold text-text mb-4">
            Fotos
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {profile.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-background group">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                {isEditing && (
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-light text-text-tertiary hover:border-primary hover:text-primary transition-all duration-150">
                <Upload className="h-5 w-5" />
                <span className="text-[11px] font-medium">Hinzufügen</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {!isEditing && !profile.photos.length && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-background py-8 text-text-tertiary">
              <Upload className="h-7 w-7" />
              <p className="text-[13px]">Keine Fotos vorhanden</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h3 className="text-[15px] font-semibold text-text mb-3">
            Über uns
          </h3>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Beschreiben Sie Ihr Unternehmen..."
              className={cn(inputClass, 'resize-none')}
            />
          ) : (
            <p className="text-[14px] leading-relaxed text-text-secondary whitespace-pre-wrap">
              {profile.description || 'Keine Beschreibung vorhanden'}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h3 className="text-[15px] font-semibold text-text mb-3">
            Links
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setLinks(updated);
                    }}
                    placeholder="Label"
                    className={cn(inputClass, 'flex-1')}
                  />
                  <input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setLinks(updated);
                    }}
                    placeholder="https://..."
                    className={cn(inputClass, 'flex-1')}
                  />
                  <button
                    onClick={() => setLinks(links.filter((_, j) => j !== i))}
                    className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-text-tertiary hover:bg-error-light hover:text-error transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setLinks([...links, { label: '', url: '' }])}
                className="text-[13px] font-medium text-primary hover:text-primary-dark transition-colors"
              >
                + Link hinzufügen
              </button>
            </div>
          ) : profile.links.length > 0 ? (
            <div className="space-y-2">
              {profile.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-tertiary">Keine Links vorhanden</p>
          )}
        </div>

        {/* Culture Profile */}
        <CultureProfileSection
          isEditing={isEditing}
          cultureScores={isEditing ? cultureScores : (profile.cultureScores ?? {})}
          onCultureChange={setCultureScores}
          dealbreakers={isEditing ? cultureDealbreakers : (profile.cultureDealbreakers ?? {})}
          onDealbreakersChange={setCultureDealbreakers}
          presetId={isEditing ? culturePresetId : profile.culturePresetId}
          onPresetChange={setCulturePresetId}
        />

        {/* Details (view mode) */}
        {!isEditing && (
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="text-[15px] font-semibold text-text mb-4">
              Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <User className="h-3.5 w-3.5 text-text-tertiary" />
                  Kontaktperson
                </span>
                <span className="text-[13px] font-medium text-text">
                  {profile.contactPersonName}
                  {profile.contactPersonRole && (
                    <span className="text-text-secondary font-normal">, {profile.contactPersonRole}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-text-secondary">
                  <Building2 className="h-3.5 w-3.5 text-text-tertiary" />
                  Grösse
                </span>
                <span className="text-[13px] font-medium text-text">
                  {SIZE_OPTIONS.find((s) => s.value === profile.companySize)?.label || profile.companySize}
                </span>
              </div>
              {profile.address && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 text-text-tertiary" />
                    Adresse
                  </span>
                  <span className="text-[13px] font-medium text-text">{profile.address}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-text-secondary">
                    <Globe className="h-3.5 w-3.5 text-text-tertiary" />
                    Website
                  </span>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
