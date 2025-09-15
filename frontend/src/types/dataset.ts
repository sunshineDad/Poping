export type DatasetStatus = 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED'

export interface DatasetSummary {
  datasetId: string
  title: string
  description: string
  type: 'text' | 'image' | 'audio' | 'video' | 'table'
  tags: string[]
  status: DatasetStatus
  parseProgress: number
  recordCount: number
  fileCount: number
  totalSize: number
  createdAt: string
  updatedAt: string
}

export interface DatasetFile {
  fileId: string
  originalName: string
  storedName: string
  fileType: string | null
  fileSize: number
  downloadUrl: string | null
  status: string
}

export interface DatasetDetail extends DatasetSummary {
  files: DatasetFile[]
}

export interface DatasetListResponse {
  items: DatasetSummary[]
  total: number
  page: number
  size: number
}

export interface CreateDatasetPayload {
  title: string
  description: string
  type: 'text' | 'image' | 'audio' | 'video' | 'table'
  tags: string[]
}

export interface DatasetProgressMessage {
  datasetId: string
  status: DatasetStatus
  progress: number
  message?: string
  timestamp: string
}
