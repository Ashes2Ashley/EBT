import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Send, 
  PlusCircle, 
  Sliders, 
  Radio, 
  Terminal, 
  Lock,
  Cpu,
  Clock,
  ExternalLink
} from 'lucide-react';
import { IncidentTicket, ThreatLevel } from '../types/osint';
import { INITIAL_INCIDENT_TICKETS } from '../data/forensicsData';
import { soundManager } from '../utils/audioAlert';

interface IncidentWarRoomProps {
  onDispatchAlert: (title: string, details: string) => void;
  isAdmin: boolean;
}

export const IncidentWarRoom: React.FC<IncidentWarRoomProps> = ({ onDispatchAlert, isAdmin }) => {
  const [tickets, setTickets] = useState<IncidentTicket[]>(INITIAL_INCIDENT_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<IncidentTicket>(INITIAL_INCIDENT_TICKETS[0]);
  const [defconLevel, setDefconLevel] = useState<number>(2);
  const [newNoteText, setNewNoteText] = useState('');
  const [gridLockdownActive, setGridLockdownActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket state
  const [newTitle, setNewTitle] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newState, setNewState] = useState<'Georgia' | 'Florida'>('Georgia');
  const [newSeverity, setNewSeverity] = useState<ThreatLevel>('CRITICAL');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const time = new Date().toISOString().split('T')[1].slice(0, 5) + ' UTC';
    const entry = `[${time}] ${newNoteText.trim()}`;

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, notes: [...t.notes, entry] };
      }
      return t;
    }));

    setSelectedTicket(prev => ({
      ...prev,
      notes: [...prev.notes, entry]
    }));

    setNewNoteText('');
    soundManager.playAlertChime('MED');
  };

  const handleStatusChange = (newStatus: IncidentTicket['status']) => {
    soundManager.playAlertChime('HIGH');
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
    setSelectedTicket(prev => ({ ...prev, status: newStatus }));

    onDispatchAlert(
      `INCIDENT UPDATE [${selectedTicket.id}]: Status changed to ${newStatus}`,
      `Facility: ${selectedTicket.facility} (${selectedTicket.affectedState}). Target threat: ${selectedTicket.threatActor || 'Adversary'}`
    );
  };

  const handleToggleGridLockdown = () => {
    if (!isAdmin) {
      soundManager.playAlertChime('CRITICAL');
      return;
    }
    const next = !gridLockdownActive;
    setGridLockdownActive(next);
    soundManager.playAlertChime('CRITICAL');

    onDispatchAlert(
      next ? '🚨 EMERGENCY SOUTHEAST GRID AIR-GAP LOCKDOWN ACTIVATED' : 'CIVIL DEFENSE: Air-gap lockdown suspended',
      next
        ? 'All inbound BGP routes from high-risk foreign ASNs null-routed. Georgia Power & Florida Power & Light ICS subnets placed on air-gap perimeter mode.'
        : 'Perimeter routing restored to normal telemetry monitoring.'
    );
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTicket: IncidentTicket = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      severity: newSeverity,
      status: 'OPEN',
      affectedState: newState,
      facility: newFacility || `${newState} Critical Node`,
      assignedUnit: `${newState} Cyber Taskforce Command`,
      createdTime: 'Just Now',
      notes: [`[${new Date().toLocaleTimeString()} UTC] Incident created by SOC operator.`]
    };

    setTickets(prev => [newTicket, ...prev]);
    setSelectedTicket(newTicket);
    setShowCreateModal(false);
    setNewTitle('');
    setNewFacility('');
    soundManager.playAlertChime('HIGH');
  };

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Tactical DEFCON & Air-Gap Command Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              TACTICAL INCIDENT COMMAND WAR ROOM // SECTOR 4
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time crisis management, ICS/SCADA air-gap containment, and emergency inter-agency triage
          </p>
        </div>

        {/* DEFCON Slider & Emergency Airgap Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">DEFCON:</span>
            <span className={`font-black ${defconLevel <= 2 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              LEVEL {defconLevel}
            </span>
            <input
              type="range"
              min="1"
              max="5"
              value={defconLevel}
              onChange={(e) => setDefconLevel(parseInt(e.target.value))}
              aria-label="Set DEFCON readiness level"
              className="w-20 accent-emerald-500"
            />
          </div>

          <button
            onClick={handleToggleGridLockdown}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              gridLockdownActive
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-950'
                : 'bg-red-950/60 hover:bg-red-900/70 border border-red-500/60 text-red-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{gridLockdownActive ? 'AIR-GAP LOCKDOWN LIVE' : 'TRIGGER EMERGENCY AIR-GAP'}</span>
          </button>
        </div>
      </div>

      {/* Main War Room Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Ticket Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Incident Tickets ({tickets.length}):
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Ticket</span>
            </button>
          </div>

          <div className="space-y-2">
            {tickets.map(t => {
              const isSelected = selectedTicket.id === t.id;
              const isCrit = t.severity === 'CRITICAL';
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    soundManager.playAlertChime('MED');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{t.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isCrit ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {t.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs leading-snug">{t.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="text-emerald-400">{t.affectedState}</span>
                    <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Command Console (8 Cols) */}
        <div className="lg:col-span-8 rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 font-mono">{selectedTicket.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold">
                  {selectedTicket.affectedState.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold">
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {selectedTicket.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Facility: {selectedTicket.facility}</p>
            </div>

            {/* Quick Status Changers */}
            <div className="flex flex-wrap gap-1.5">
              {(['CONTAINMENT_IN_PROGRESS', 'RESOLVED', 'OPEN'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`text-[10px] px-2.5 py-1 rounded font-bold border transition ${
                    selectedTicket.status === st
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Telemetry Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ASSIGNED SOC UNIT:</span>
              <span className="text-slate-200 font-semibold">{selectedTicket.assignedUnit}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ATTRIBUTED ADVERSARY:</span>
              <span className="text-red-400 font-bold">{selectedTicket.threatActor || 'Investigating'}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">CVE VULNERABILITY:</span>
              <span className="text-amber-300 font-mono text-[11px]">{selectedTicket.cve || 'N/A'}</span>
            </div>
          </div>

          {/* Triage Log Stream */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Incident Response Triage Log:
            </span>
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 max-h-[180px] overflow-y-auto space-y-1.5 text-xs text-slate-300 font-mono">
              {selectedTicket.notes.map((n, i) => (
                <p key={i} className="leading-relaxed">{n}</p>
              ))}
            </div>
          </div>

          {/* Append Note Input */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              placeholder="Add tactical response note, action update, or containment instruction..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
            >
              Post Note
            </button>
          </form>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/50 bg-slate-950 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Open Crisis Incident Ticket
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Headline:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inbound Modbus flood on Plant Vogtle Grid"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State Focus:</label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value as 'Georgia' | 'Florida')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Georgia">Georgia</option>
                    <option value="Florida">Florida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as ThreatLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="ELEVATED">ELEVATED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Facility / Infrastructure:</label>
                <input
                  type="text"
                  placeholder="e.g. Savannah River SCADA Distribution"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider transition"
              >
                Create Incident Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
