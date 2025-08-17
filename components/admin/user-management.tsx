'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  MapPin,
  Building,
  Eye,
  Edit,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { VerificationBadge } from '@/components/profile/verification-badge'

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'creator' | 'printShop' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  createdAt: string
  lastLogin?: string
  profile?: {
    location?: {
      city?: string
      state?: string
    }
    businessInfo?: {
      businessName?: string
      businessType?: string
    }
    verification?: {
      status: 'verified' | 'pending' | 'rejected' | 'unverified'
    }
  }
}

interface UserManagementProps {
  users: User[]
  onRoleChange: (userId: string, newRole: string, reason: string) => Promise<void>
  onStatusChange: (userId: string, newStatus: string, reason: string) => Promise<void>
  onExportUsers: () => Promise<void>
  isLoading?: boolean
}

const ROLE_LABELS = {
  customer: 'Customer',
  creator: 'Creator', 
  printShop: 'Print Shop',
  admin: 'Admin'
}

const STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending'
}

export function UserManagement({ 
  users, 
  onRoleChange, 
  onStatusChange, 
  onExportUsers,
  isLoading = false 
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'role' | 'status' | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [actionReason, setActionReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.businessInfo?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  // User statistics
  const stats = useMemo(() => {
    const total = users.length
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const statusStats = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, roleStats, statusStats }
  }, [users])

  const handleAction = async () => {
    if (!selectedUser || !actionType || processing) return

    const reason = actionReason.trim()
    if (!reason) {
      alert('Please provide a reason for this action')
      return
    }

    setProcessing(selectedUser.id)
    
    try {
      if (actionType === 'role' && newRole) {
        await onRoleChange(selectedUser.id, newRole, reason)
      } else if (actionType === 'status' && newStatus) {
        await onStatusChange(selectedUser.id, newStatus, reason)
      }
      
      resetAction()
    } catch (error) {
      console.error('Action failed:', error)
      alert('Action failed. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const resetAction = () => {
    setSelectedUser(null)
    setActionType(null)
    setNewRole('')
    setNewStatus('')
    setActionReason('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Suspended</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      printShop: 'default',
      creator: 'secondary',
      customer: 'outline'
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and account status across the platform
          </p>
        </div>
        <Button onClick={onExportUsers} disabled={isLoading} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Print Shops</p>
                <p className="text-2xl font-bold">{stats.roleStats.printShop || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.statusStats.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">{stats.statusStats.suspended || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="creator">Creators</SelectItem>
                <SelectItem value="printShop">Print Shops</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  No users match your current filters.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {user.email}
                            {!user.emailVerified && (
                              <Badge variant="destructive" className="text-xs">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        
                        {user.role === 'printShop' && user.profile?.verification && (
                          <VerificationBadge 
                            status={user.profile.verification.status} 
                            size="sm" 
                          />
                        )}

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDate(user.createdAt)}
                        </div>

                        {user.profile?.location?.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {user.profile.location.city}, {user.profile.location.state}
                          </div>
                        )}
                      </div>

                      {user.profile?.businessInfo?.businessName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4" />
                          <span className="font-medium">{user.profile.businessInfo.businessName}</span>
                          <Badge variant="outline" className="capitalize">
                            {user.profile.businessInfo.businessType?.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setActionType('role')
                          setNewRole(user.role)
                        }}
                        disabled={isLoading || processing === user.id}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Change Role
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setActionType('status')
                          setNewStatus(user.status)
                        }}
                        disabled={isLoading || processing === user.id}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Change Status
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {actionType === 'role' ? 'Change User Role' : 'Change User Status'}
              </CardTitle>
              <CardDescription>
                User: {selectedUser.name} ({selectedUser.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionType === 'role' ? (
                <div>
                  <label className="text-sm font-medium">New Role</label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="printShop">Print Shop</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Reason for Change *</label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain why this change is being made..."
                  className="mt-1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetAction}
                  disabled={processing === selectedUser.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={
                    processing === selectedUser.id || 
                    !actionReason.trim() ||
                    (actionType === 'role' && newRole === selectedUser.role) ||
                    (actionType === 'status' && newStatus === selectedUser.status)
                  }
                  className="flex-1"
                >
                  {processing === selectedUser.id ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Processing...
                    </>
                  ) : (
                    'Apply Change'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}