import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { HiArchive, HiRefresh } from "react-icons/hi";
import Swal from "sweetalert2";
import { refreshBatches } from "../utils/batches";
import { yearLabel } from "../utils/projectEligibility";

const readApiError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/**
 * Master admin page listing every program and batch with students. A
 * batch can be archived (e.g. once it passes out) so it is hidden by
 * default in lists and filters; nothing is deleted and it can be made
 * active again at any time.
 */
const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/v1/batches");
      setBatches(response.data.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not load batches",
        text: readApiError(err, "Failed to load batches."),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (b) => {
    const archiving = !b.archived;
    const confirmed = await Swal.fire({
      icon: "question",
      title: archiving
        ? `Archive ${b.programLabel} K${b.batch}?`
        : `Make ${b.programLabel} K${b.batch} active again?`,
      text: archiving
        ? "The batch will be hidden by default on faculty and admin lists and filters. Nothing is deleted, and it can still be chosen and edited."
        : "The batch will show up again by default everywhere.",
      showCancelButton: true,
      confirmButtonText: archiving ? "Yes, archive" : "Yes, make active",
      confirmButtonColor: "#2563eb",
    });
    if (!confirmed.isConfirmed) return;
    try {
      setBusy(true);
      const response = await axios.post(
        `/api/v1/batches/${archiving ? "archive" : "unarchive"}`,
        { program: b.program, batch: b.batch }
      );
      refreshBatches();
      Swal.fire({ icon: "success", title: response.data.message });
      load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not update the batch",
        text: readApiError(err, "Failed to update the batch."),
      });
    } finally {
      setBusy(false);
    }
  };

  const yearText = (b) =>
    b.passedOut
      ? "Passed out"
      : b.year < 1
        ? "Not started yet"
        : yearLabel(b.year);

  const toArchive = batches.filter((b) => b.passedOut && !b.archived);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-blue-700">
            <HiArchive /> Batches
          </h1>
          <p className="mt-1 text-gray-600">
            Archive a batch once it has passed out. Archived batches are hidden
            by default on faculty project pages, My Students, Application Status
            and Edit Allotment, but nothing is deleted and they can still be
            picked from the batch filters.
          </p>
        </header>

        {toArchive.length > 0 && (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Passed out but not archived yet:{" "}
            <b>
              {toArchive.map((b) => `${b.programLabel} K${b.batch}`).join(", ")}
            </b>
            .
          </p>
        )}

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <HiRefresh /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Year of study</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => (
                    <tr
                      key={`${b.program}-${b.batch}`}
                      className="border-t border-gray-100"
                    >
                      <td className="px-4 py-3">{b.programLabel}</td>
                      <td className="px-4 py-3 font-semibold">K{b.batch}</td>
                      <td className="px-4 py-3">{yearText(b)}</td>
                      <td className="px-4 py-3">{b.students}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            b.archived
                              ? "bg-gray-200 text-gray-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {b.archived ? "Archived" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => toggle(b)}
                          className={`rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            b.archived
                              ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                              : "border border-blue-600 text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          {b.archived ? "Make active" : "Archive"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminBatches;
