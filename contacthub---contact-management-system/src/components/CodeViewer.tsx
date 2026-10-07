import React, { useState } from 'react';
import { FLASK_PROJECT_FILES, ProjectFile } from '../data/flaskProjectFiles';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  FolderTree, 
  ExternalLink,
  Info,
  Laptop,
  PlayCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { downloadProjectZip } from '../utils/zipGenerator';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(FLASK_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [setupOs, setSetupOs] = useState<'windows' | 'mac' | 'vscode'>('windows');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip();
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Localhost Ready (127.0.0.1:5000)
            </span>
            <span className="text-xs text-slate-400">Python Flask &bull; SQLite3 &bull; Bootstrap 5</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Python Flask Source Code & Localhost Guide</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Download the complete project bundle to run on your local computer's localhost. Includes 1-click launch scripts!
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Generating ZIP...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Localhost Step-by-Step Instructions Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">How to Run on Your Localhost (`localhost:5000`)</h3>
              <p className="text-xs text-slate-300">Run natively in Python Flask on your laptop or PC</p>
            </div>
          </div>

          {/* OS Switcher */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSetupOs('windows')}
              className={`px-3 py-1 rounded-lg transition ${
                setupOs === 'windows' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Windows (1-Click)
            </button>
            <button
              onClick={() => setSetupOs('vscode')}
              className={`px-3 py-1 rounded-lg transition ${
                setupOs === 'vscode' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              VS Code / Terminal
            </button>
            <button
              onClick={() => setSetupOs('mac')}
              className={`px-3 py-1 rounded-lg transition ${
                setupOs === 'mac' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Mac / Linux
            </button>
          </div>
        </div>

        {/* Dynamic OS Steps */}
        {setupOs === 'windows' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Step 1: Download & Extract
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the green <strong>"Download Project (.ZIP)"</strong> button above and extract the zip file to your desktop or folder.
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Step 2: Double-Click `run.bat`
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inside the folder, double-click <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-amber-300">run.bat</code>. It installs dependencies, sets up SQLite, and opens your browser!
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Step 3: Enjoy on Localhost
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your browser will open automatically at <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-cyan-300">http://127.0.0.1:5000</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {setupOs === 'vscode' && (
          <div className="space-y-3 font-mono text-xs text-slate-200">
            <p className="text-xs text-slate-300 font-sans">
              Open the extracted <code className="text-emerald-400 font-mono">contact_management</code> folder in VS Code, open the integrated terminal (<kbd className="bg-white/10 px-1 rounded">Ctrl + `</kbd>), and run:
            </p>
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-slate-400"># Install Flask and start server:</div>
                <div className="text-emerald-400 font-bold">pip install -r requirements.txt && python app.py</div>
              </div>
              <button
                onClick={() => handleCopyCommand('pip install -r requirements.txt && python app.py')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-sans font-semibold text-white flex items-center gap-1"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {setupOs === 'mac' && (
          <div className="space-y-3 font-mono text-xs text-slate-200">
            <p className="text-xs text-slate-300 font-sans">
              On macOS or Linux, open Terminal, navigate to the extracted folder, and run:
            </p>
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-slate-400"># Execute 1-click launcher script:</div>
                <div className="text-emerald-400 font-bold">bash run.sh</div>
              </div>
              <button
                onClick={() => handleCopyCommand('bash run.sh')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-sans font-semibold text-white flex items-center gap-1"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Split: File Explorer & Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold uppercase text-slate-500 tracking-wider">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>Project File Tree ({FLASK_PROJECT_FILES.length} Files)</span>
          </div>

          <div className="space-y-1">
            {FLASK_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Server Setup</span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                Uses Python standard library <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">sqlite3</code>.
                No MySQL or PostgreSQL database server configuration is required on your localhost!
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl shadow-lg border border-slate-800 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">{selectedFile.path}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code content */}
          <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="pr-4 py-0.5 text-right text-slate-600 select-none text-[11px] w-10">
                      {idx + 1}
                    </td>
                    <td className="py-0.5 whitespace-pre font-mono text-slate-300">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
