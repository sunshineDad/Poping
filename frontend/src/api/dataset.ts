import { get, upload, del } from '@/utils/http'
import type {
  CreateDatasetPayload,
  DatasetDetail,
  DatasetListResponse,
} from '@/types/dataset'

export interface FetchDatasetParams {
  page?: number
  size?: number
  keyword?: string
  type?: string
  status?: string
}

export const fetchDatasets = (params: FetchDatasetParams = {}) => {
  return get<DatasetListResponse>('/v1/datasets', {
    params,
  })
}

export const fetchDatasetDetail = (datasetId: string) => {
  return get<DatasetDetail>(`/v1/datasets/${datasetId}`)
}

export const createDataset = (payload: CreateDatasetPayload, files: File[]) => {
  const formData = new FormData()
  formData.append(
    'metadata',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  )

  files.forEach((file) => {
    formData.append('files', file)
  })

  return upload<DatasetDetail>('/v1/datasets', formData)
}

export const removeDataset = (datasetId: string) => {
  return del<void>(`/v1/datasets/${datasetId}`)
}
