import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
}

export function DataTable<T>({
  title,
  description,
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-3 text-left font-medium text-slate-500"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr key={index} className="align-top">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-4 text-slate-700">
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
