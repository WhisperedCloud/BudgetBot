import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ categoryData }: { categoryData: { name: string, value: number }[] }) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-48">
        <p className="text-sm opacity-50">No data available for chart</p>
      </div>
    );
  }

  const data = {
    labels: categoryData.map(item => item.name),
    datasets: [
      {
        data: categoryData.map(item => item.value),
        backgroundColor: [
          '#0A1E3D', // Deep Navy
          '#245F73', // Deep Blue
          '#CCA43B', // Accent Gold
          '#005A70', // Teal / Primary
          '#12284C', // Navy Light / Border
          '#808285', // Muted Gray
          '#BBBDBC', // Light Gray
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#245F73',
        bodyColor: '#1F2937',
        borderColor: '#BBBDBC',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
            }
            return label;
          }
        }
      },
    },
    layout: {
      padding: 10
    }
  };

  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center">
      <Doughnut data={data} options={options} />
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
        <span className="text-xl font-light text-foreground">
          ₹{categoryData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
