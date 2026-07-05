import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ExpenseBarChart({ categoryData }: { categoryData: { name: string, type?: string, value: number }[] }) {
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
        label: 'Amount',
        data: categoryData.map(item => item.value),
        backgroundColor: categoryData.map(item => item.type === 'INCOME' || item.name === 'Total Income' ? '#16a34a' : '#ef4444'),
        hoverBackgroundColor: categoryData.map(item => item.type === 'INCOME' || item.name === 'Total Income' ? '#15803d' : '#dc2626'),
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 30, 61, 0.95)', // Navy background for tooltip
        titleColor: '#E5E7EB', // Off-White
        bodyColor: '#CCA43B', // Accent Gold
        borderColor: '#12284C',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#808285', // Muted foreground
          font: {
            size: 12,
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        display: false, // hide y axis for cleaner minimal look
        grid: {
          display: false,
          drawBorder: false,
        },
        beginAtZero: true,
        border: {
          display: false,
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center">
      <Bar data={data} options={options} />
    </div>
  );
}
