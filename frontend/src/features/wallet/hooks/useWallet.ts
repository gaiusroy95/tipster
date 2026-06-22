import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { WalletTransaction } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

interface WalletData {
  balance: number
  transactions: WalletTransaction[]
}

export function useWallet() {
  return useQuery({
    queryKey: queryKeys.wallet.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<WalletData>>('/wallet')
      return res.data.data
    },
  })
}
