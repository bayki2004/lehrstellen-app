'use client';

import Link from 'next/link';
import { FileText, Plus, Trash2, Pencil, MapPin } from 'lucide-react';
import { useMyListings, useDeleteListing } from '@/hooks/use-listings';
import { toast } from 'sonner';

export default function StellenPage() {
  const { data: listings, isLoading } = useMyListings();
  const deleteListing = useDeleteListing();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`"${title}" wirklich löschen?`)) return;
    deleteListing.mutate(id, {
      onSuccess: () => toast.success('Stelle gelöscht'),
      onError: () => toast.error('Fehler beim Löschen'),
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            Stellen
          </h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Verwalten Sie Ihre Lehrstellen
          </p>
        </div>
        <Link
          href="/stellen/create"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Neue Stelle
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        </div>
      ) : !listings?.length ? (
        <div className="rounded-2xl bg-white p-14 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background">
            <FileText className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-[16px] font-semibold text-text">
            Keine Stellen vorhanden
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Erstellen Sie Ihre erste Lehrstelle
          </p>
          <Link
            href="/stellen/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Stelle
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Stelle
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Standort
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Plätze
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/60">
              {listings.map((listing) => (
                <tr key={listing.id} className="group hover:bg-background/40 transition-colors duration-100">
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-text">
                      {listing.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-tertiary">
                      {listing.field}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] text-text-secondary">
                      <MapPin className="h-3 w-3 text-text-tertiary" />
                      {listing.canton}, {listing.city}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-medium text-text tabular-nums">
                      {listing.spotsAvailable}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-2.5 py-1 text-[11px] font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Aktiv
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                      <Link
                        href={`/stellen/${listing.id}/edit`}
                        className="rounded-lg p-2 text-text-tertiary hover:bg-background hover:text-text transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id, listing.title)}
                        className="rounded-lg p-2 text-text-tertiary hover:bg-error-light hover:text-error transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
