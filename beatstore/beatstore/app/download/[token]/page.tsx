"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import {
  HiArrowDownTray,
  HiExclamationTriangle,
  HiMusicalNote,
} from "react-icons/hi2";

interface DownloadFile {
  format: string;
  url: string;
}

interface DownloadItem {
  title: string;
  licenseType: string;
  files: DownloadFile[];
}

interface DownloadData {
  order: {
    id: string;
    email: string;
    downloadsRemaining: number;
  };
  downloads: DownloadItem[];
}

export default function DownloadPage() {
  const params = useParams();
  const [data, setData] = useState<DownloadData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/download/${params.token}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 max-w-lg mx-auto">
        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full
                          animate-spin mx-auto mb-4" />
            <p className="text-neutral-500">Loading your downloads...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <HiExclamationTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h1 className="font-display font-bold text-xl text-neutral-100 mb-2">
              Download Unavailable
            </h1>
            <p className="text-neutral-500">{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="text-center mb-8">
              <HiMusicalNote className="w-10 h-10 text-accent mx-auto mb-4" />
              <h1 className="font-display font-bold text-2xl text-neutral-50 mb-2">
                Your Downloads
              </h1>
              <p className="text-sm text-neutral-500">
                {data.order.downloadsRemaining} downloads remaining
              </p>
            </div>

            <div className="space-y-4">
              {data.downloads.map((item, i) => (
                <div
                  key={i}
                  className="bg-surface-100 border border-surface-300 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-neutral-100">
                      {item.title}
                    </h3>
                    <span className="tag">{item.licenseType}</span>
                  </div>

                  <div className="space-y-2">
                    {item.files.map((file) => (
                      <a
                        key={file.format}
                        href={file.url}
                        download
                        className="flex items-center justify-between p-3 bg-surface-200
                                 border border-surface-300 rounded-lg hover:border-accent/30
                                 transition-all group"
                      >
                        <span className="text-sm text-neutral-300 font-medium">
                          {file.format.toUpperCase()} File
                        </span>
                        <HiArrowDownTray className="w-4 h-4 text-neutral-500
                                                   group-hover:text-accent transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
