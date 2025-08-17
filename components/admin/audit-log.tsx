'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Calendar, 
  User, 
  Shield, 
  Activity,
  Filter,
  FileText
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  adminId: string
  adminName: string
  adminEmail: string
  action: string
  targetType: 'user' | 'verification' | 'system'
  targetId?: string
  targetName?: string
  details: {
    before?: any
    after?: any
    reason?: string
  }
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

interface AuditLogProps {
  entries: AuditLogEntry[]
  isLoading?: boolean
}

export function AuditLog({ entries, isLoading = false }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [targetFilter, setTargetFilter] = useState<string>('all')

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || entry.action.includes(actionFilter)
    const matchesTarget = targetFilter === 'all' || entry.targetType === targetFilter

    return matchesSearch && matchesAction && matchesTarget
  })

  const getActionBadge = (action: string) => {
    if (action.includes('role')) {
      return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />Role Change</Badge>
    } else if (action.includes('status')) {
      return <Badge variant="outline"><User className="w-3 h-3 mr-1" />Status Change</Badge>
    } else if (action.includes('verification')) {
      return <Badge variant="default"><FileText className="w-3 h-3 mr-1" />Verification</Badge>
    } else {
      return <Badge variant="outline"><Activity className="w-3 h-3 mr-1" />System</Badge>
    }
  }

  const getTargetBadge = (targetType: string) => {
    const variants = {
      user: 'default',
      verification: 'secondary',
      system: 'outline'
    } as const

    return (
      <Badge variant={variants[targetType as keyof typeof variants] || 'outline'}>
        {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Audit Log</h2>
        <p className="text-muted-foreground">
          Track all administrative actions and changes made to the platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="role">Role Changes</SelectItem>
                <SelectItem value="status">Status Changes</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="verification">Verifications</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredEntries.length} of {entries.length} entries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Administrative actions performed on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground mt-2">Loading audit log...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activities Found</h3>
              <p className="text-muted-foreground">
                No audit log entries match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {entry.adminName} ({entry.adminEmail})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {getActionBadge(entry.action)}
                        {getTargetBadge(entry.targetType)}
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>

                      {entry.targetName && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Target: </span>
                          <span className="font-medium">{entry.targetName}</span>
                        </div>
                      )}

                      {entry.details.reason && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          <span>{entry.details.reason}</span>
                        </div>
                      )}

                      {(entry.details.before || entry.details.after) && (
                        <div className="text-xs bg-muted p-2 rounded">
                          {entry.details.before && (
                            <div>
                              <span className="font-medium">Before: </span>
                              <span className="text-muted-foreground">
                                {JSON.stringify(entry.details.before)}
                              </span>
                            </div>
                          )}
                          {entry.details.after && (
                            <div>
                              <span className="font-medium">After: </span>
                              <span className="text-muted-foreground">
                                {JSON.stringify(entry.details.after)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}