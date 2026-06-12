import React from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2 } from 'lucide-react';

function ManageProblem() {
  const problemOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding challenge to the platform.',
      icon: Plus,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/30',
      route: '/admin/problems/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Modify existing challenges, tags, and test cases.',
      icon: Edit,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      borderHover: 'hover:border-blue-500/30',
      route: '/admin/problems/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove a problem from the database.',
      icon: Trash2,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      borderHover: 'hover:border-red-500/30',
      route: '/admin/problems/delete'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white h-full">
      
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
          Manage Problems
        </h1>
        <p className="text-zinc-400 text-sm">
          Select an action below to add, modify, or remove coding challenges from the platform database.
        </p>
      </div>

      {/* 3-Column Square Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {problemOptions.map((option) => {
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
              <h2 className="font-display text-2xl font-bold mb-3 tracking-wide">
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

export default ManageProblem;