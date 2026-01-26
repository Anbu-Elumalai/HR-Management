import React from 'react';
import { Users, Calendar, UserPlus, Heart } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import WorkingFormatChart from '../components/dashboard/WorkingFormatChart';
import ProjectEmploymentChart from '../components/dashboard/ProjectEmploymentChart';
import ApplicationsChart from '../components/dashboard/ApplicationsChart';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import StaffTurnoverChart from '../components/dashboard/StaffTurnoverChart';
import RecruitmentProgress from '../components/dashboard/RecruitmentProgress';

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      {/* Top Stats Row */}
      <div className="stats-grid">
        <StatsCard
          title="Total employees"
          value="352"
          icon={Users}
          trend="up"
          trendValue="+15%"
        />
        <StatsCard
          title="Number of leave"
          value="22"
          icon={Calendar}
          trend="down"
          trendValue="-10%"
        />
        <StatsCard
          title="New employees"
          value="32"
          icon={UserPlus}
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Happiness rate"
          value="82%"
          icon={Heart}
          trend="down"
          trendValue="-11%"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-wrapper">
          <WorkingFormatChart />
        </div>
        <div className="chart-wrapper">
          <ProjectEmploymentChart />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        <div className="chart-wrapper">
          <ApplicationsChart />
        </div>
        <div className="chart-wrapper">
          <AttendanceChart />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="charts-row">
        <div className="chart-wrapper">
          <StaffTurnoverChart />
        </div>
        <div className="chart-wrapper">
          <RecruitmentProgress />
        </div>
      </div>

      <style>{`
                .dashboard-home {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }

                .charts-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .chart-wrapper {
                    height: 400px; /* Increased height to prevent overflow */
                }

                @media (max-width: 768px) {
                    .charts-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
    </div>
  );
};

export default DashboardHome;
