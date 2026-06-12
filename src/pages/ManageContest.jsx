import React from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';

function ManageContest() {
  const contestOptions = [
    {
      id: 'create',
      title: 'Create Contest',
      description: 'Schedule and configure a new competitive programming arena.',
      icon: Plus,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/30',
      route: '/admin/contests/create'
    },
    {
      id: 'update',
      title: 'Update Upcoming',
      description: 'Modify timings, rules, or problem sets for scheduled contests.',
      icon: Edit,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      borderHover: 'hover:border-blue-500/30',
      route: '/admin/contests/update'
    },
    {
      id: 'delete',
      title: 'Delete Upcoming',
      description: 'Cancel and permanently remove a scheduled contest.',
      icon: Trash2,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      borderHover: 'hover:border-red-500/30',
      route: '/admin/contests/delete'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy size={32} className="text-[#C9963A]" />
            <h1 className="font-display text-3xl font-bold tracking-tight">
            Manage Contests
            </h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Select an action below to schedule, modify, or cancel upcoming competitive programming contests.
        </p>
      </div>

      {/* 3-Column Square Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {contestOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Link
              key={option.id}
              to={option.route}
              className={`aspect-square bg-[#111] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-[#161618] transition-all duration-300 group shadow-lg ${option.borderHover}`}
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-full ${option.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent size={32} className={option.iconColor} strokeWidth={2} />
              </div>
              
              {/* Title */}
              <h2 className="font-display text-2xl font-bold mb-3 tracking-wide text-center">
                {option.title}
              </h2>
              
              {/* Description */}
              <p className="text-zinc-500 text-xs text-center leading-relaxed px-4">
                {option.description}
              </p>
            </Link>
          );
        })}
      </div>

    </div>
  );
}

export default ManageContest;