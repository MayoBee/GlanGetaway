import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../../api-client';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { useToast } from '../../hooks/use-toast';
import { ResortType } from '../../../../shared/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SmartImage } from '../SmartImage';
import { LoadingSpinner } from '../LoadingSpinner';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';

interface ResortApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// Add missing API functions (assuming they exist or will be implemented)
const fetchPendingResorts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: ResortType[]; pagination: any }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  const response = await apiClient.axiosInstance.get(`/api/admin/resorts/pending?${queryParams}`);
  return response.data;
};

const updateResortStatus = async (resortId: string, status: string, reason?: string) => {
  const response = await apiClient.axiosInstance.patch(`/api/admin/resorts/${resortId}/status`, {
    status,
    reason
  });
  return response.data;
};

const fetchResortStats = async (): Promise<ResortApprovalStats> => {
  const response = await apiClient.axiosInstance.get('/api/admin/resorts/stats');
  return response.data;
};

const ResortApprovalModule: React.FC = () => {
  const { canApproveResorts } = useRoleBasedAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResort, setSelectedResort] = useState<ResortType | null>(null);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; resortId: string; resortName: string; currentStatus: string }>({
    open: false,
    resortId: '',
    resortName: '',
    currentStatus: ''
  });
  const [statusReason, setStatusReason] = useState('');

  const { data: resortsData, isLoading: resortsLoading } = useQuery(
    ['resorts', activeTab, currentPage, searchTerm],
    () => fetchPendingResorts({
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
    }),
    { enabled: canApproveResorts }
  );

  const { data: stats } = useQuery('resortStats', fetchResortStats, { enabled: canApproveResorts });

  const updateStatusMutation = useMutation(
    ({ resortId, status, reason }: { resortId: string; status: string; reason?: string }) =>
      updateResortStatus(resortId, status, reason),
    {
      onSuccess: (data) => {
        toast({
          title: 'Status Updated',
          description: `Resort status has been updated to ${data.status}.`,
        });
        setStatusDialog({ open: false, resortId: '', resortName: '', currentStatus: '' });
        setStatusReason('');
        queryClient.invalidateQueries(['resorts']);
        queryClient.invalidateQueries('resortStats');
      },
      onError: (error: any) => {
        toast({
          title: 'Update Failed',
          description: error.message || 'Failed to update resort status.',
          variant: 'destructive',
        });
      },
    }
  );

  const handleStatusUpdate = (resortId: string, status: string, resortName: string, currentStatus: string) => {
    if (status === currentStatus) return;
    setStatusDialog({ open: true, resortId, resortName, currentStatus });
  };

  const confirmStatusUpdate = (newStatus: string) => {
    if (statusReason.trim() === '' && newStatus === 'rejected') {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejecting this resort.',
        variant: 'destructive',
      });
      return;
    }

    updateStatusMutation.mutate({
      resortId: statusDialog.resortId,
      status: newStatus,
      reason: statusReason || undefined,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Approval', count: stats?.pending || 0 },
    { id: 'approved', label: 'Approved', count: stats?.approved || 0 },
    { id: 'rejected', label: 'Rejected', count: stats?.rejected || 0 },
  ];

  if (!canApproveResorts) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to approve resorts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resort Approval</h1>
        <p className="text-gray-600">Review and approve resort submissions</p>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by resort name, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Resorts Table */}
      {resortsLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : resortsData?.data?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No resorts found for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resort</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resortsData?.data?.map((resort: ResortType) => (
                <TableRow key={resort._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {resort.imageUrls?.[0] && (
                        <SmartImage
                          src={resort.imageUrls[0]}
                          alt={resort.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{resort.name}</div>
                        <div className="text-sm text-gray-500">{resort.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resort.ownerId?.firstName} {resort.ownerId?.lastName}</div>
                      <div className="text-sm text-gray-500">{resort.ownerId?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{resort.city}, {resort.country}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(resort.status || 'pending')}>
                      {resort.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{format(new Date(resort.createdAt || new Date()), 'MMM dd, yyyy')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResort(resort)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Resort Details</DialogTitle>
                          </DialogHeader>
                          {selectedResort && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Resort Information</h4>
                                  <p><strong>Name:</strong> {selectedResort.name}</p>
                                  <p><strong>Type:</strong> {selectedResort.type}</p>
                                  <p><strong>Location:</strong> {selectedResort.city}, {selectedResort.country}</p>
                                  <p><strong>Description:</strong> {selectedResort.description}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Owner Details</h4>
                                  <p><strong>Name:</strong> {selectedResort.ownerId?.firstName} {selectedResort.ownerId?.lastName}</p>
                                  <p><strong>Email:</strong> {selectedResort.ownerId?.email}</p>
                                </div>
                              </div>
                              {selectedResort.imageUrls && selectedResort.imageUrls.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Images</h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {selectedResort.imageUrls.map((url, index) => (
                                      <SmartImage
                                        key={index}
                                        src={url}
                                        alt={`Resort image ${index + 1}`}
                                        className="w-full h-20 object-cover rounded"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {resort.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(resort._id, 'approved', resort.name, resort.status || 'pending')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(resort._id, 'rejected', resort.name, resort.status || 'pending')}
                            disabled={updateStatusMutation.isLoading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {resortsData?.pagination && resortsData.pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {resortsData.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(resortsData.pagination.pages, prev + 1))}
            disabled={currentPage === resortsData.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Resort Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Update status for resort <strong>{statusDialog.resortName}</strong>?
              </p>
              {(statusDialog.currentStatus === 'pending') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (required for rejection)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Provide a reason..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusDialog({ open: false, resortId: '', resortName: '', currentStatus: '' });
                    setStatusReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => confirmStatusUpdate('approved')}
                  disabled={updateStatusMutation.isLoading}
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : 'Approve Resort'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmStatusUpdate('rejected')}
                  disabled={updateStatusMutation.isLoading || (!statusReason.trim())}
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : 'Reject Resort'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResortApprovalModule;