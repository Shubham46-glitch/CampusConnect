import React from 'react';

const Table = ({ headers, children, emptyMessage = 'No records found' }) => {
  return (
    <div className="w-full overflow-x-auto border border-slate-200/80 rounded-xl bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {React.Children.count(children) > 0 ? (
            children
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-8 text-center text-slate-400 italic text-xs"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
