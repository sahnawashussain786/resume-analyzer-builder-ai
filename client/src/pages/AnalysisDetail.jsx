import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ScanLine, Quote } from "lucide-react";
import { api, errMsg } from "../api/client.js";
import Navbar from "../components/Navbar.jsx";
import { Button, Card, EmptyState } from "../components/ui.jsx";
import Spinner from "../components/Spinner.jsx";
import { AnalysisResult } from "./Analyzer.jsx";

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/ai/analyses/${id}`)
      .then(({ data }) => setAnalysis(data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button variant="ghost" onClick={() => navigate("/analyzer/history")}>
          <ArrowLeft size={16} /> Back to history
        </Button>
        {loading ? (
          <Spinner full label="Loading analysis…" />
        ) : error ? (
          <Card className="mt-4">
            <EmptyState
              icon={ScanLine}
              title="Analysis not found"
              description={error}
            />
          </Card>
        ) : (
          <>
            <div className="mt-4">
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                {analysis.jobTitle || analysis.resumeName}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {[
                  analysis.jobCompany,
                  analysis.resumeName,
                  new Date(analysis.createdAt).toLocaleString(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {analysis.jobDescription && (
                <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                  <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                    Job description
                  </summary>
                  <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-500 dark:text-slate-400">
                    {analysis.jobDescription}
                  </p>
                </details>
              )}
            </div>
            <div className="mt-6">
              <AnalysisResult result={analysis.result} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/builder">
                <Button>
                  <ScanLine size={15} /> Apply fixes in the Builder
                </Button>
              </Link>
              <Link to="/analyzer">
                <Button variant="outline">
                  <Quote size={15} /> New analysis
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
