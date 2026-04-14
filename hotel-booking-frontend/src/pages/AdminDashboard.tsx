import React, { useState } from 'react';
import { useQuery } from 'react-query';
import * as apiClient from '../../api-client';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import ResortApprovalModule from '../components/admin/ResortApprovalModule';
import UserManagementModule from '../components/admin/UserManagementModule';
import BookingsManagementModule from '../components/admin/BookingsManagementModule';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Bell, Building, Users, Calendar } from 'lucide-react';

// Notification stats interface
interface NotificationStats {
  resortApprovals: number;
  userRequests: number;
  bookingUpdates: number;
}

// Fetch notification stats (assuming API exists)
const fetchNotificationStats = async (): Promise<NotificationStats> => {
  // This would fetch real-time counts for badges
  const response = await apiClient.axiosInstance.get('/api/admin/notifications/stats');
  return response.data;
};

const AdminDashboard: React.FC = () => {
  const { isAdmin, canApproveResorts, canManageUsers, canManageBookings } = useRoleBasedAccess();
  const [activeTab, setActiveTab] = useState<'resorts' | 'users' | 'bookings'>('resorts');

  // Fetch notification stats for badges
  const { data: notificationStats } = useQuery('notificationStats', fetchNotificationStats, {
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Define available tabs based on permissions
  const tabs = [
    {
      id: 'resorts' as const,
      label: 'Resort Approvals',
      icon: Building,
      component: ResortApprovalModule,
      access: canApproveResorts,
      badge: notificationStats?.resortApprovals || 0,
    },
    {
      id: 'users' as const,
      label: 'User Management',
      icon: Users,
      component: UserManagementModule,
      access: canManageUsers,
      badge: notificationStats?.userRequests || 0,
    },
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: Calendar,
      component: BookingsManagementModule,
      access: canManageBookings,
      badge: notificationStats?.bookingUpdates || 0,
    },
  ];

  // Filter tabs based on user permissions
  const accessibleTabs = tabs.filter(tab => tab.access);

  if (!isAdmin || accessibleTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have administrative privileges to access this dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeTabData = accessibleTabs.find(tab => tab.id === activeTab) || accessibleTabs[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage resorts, users, and bookings from a centralized interface
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                {(notificationStats?.resortApprovals || 0) +
                 (notificationStats?.userRequests || 0) +
                 (notificationStats?.bookingUpdates || 0) > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {(notificationStats?.resortApprovals || 0) +
                     (notificationStats?.userRequests || 0) +
                     (notificationStats?.bookingUpdates || 0)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {accessibleTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 min-w-[20px] text-xs"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTabData && <activeTabData.component />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;