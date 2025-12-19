import React, { useState, useEffect } from 'react';

const Dice = ({ value, rolling, onRoll, disabled }) => {
    // Simple CSS dice representation
    // We can just use unicode dice or dots.
    // 1: ⚀, 2: ⚁, 3: ⚂, 4: ⚃, 5: ⚄, 6: ⚅
    // But let's make it div based for rotation animation.

    const renderDots = (val) => {
        // Positioning logic (or just simple utf-8 for now for speed/robustness)
        const dicemap = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return dicemap[val - 1] || '🎲';
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onRoll}
                disabled={disabled}
                className={`w-20 h-20 bg-white border-2 border-slate-300 rounded-xl shadow-lg flex items-center justify-center text-6xl text-indigo-600 transition-transform ${rolling ? 'animate-spin' : 'hover:scale-105'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {renderDots(value || 6)}
            </button>
            <div className="mt-2 font-bold text-slate-700">
                {rolling ? 'Rolling...' : (value ? `Rolled: ${value}` : 'Roll!')}
            </div>
        </div>
    );
};

export default Dice;
