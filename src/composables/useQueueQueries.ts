import { useQuery } from '@vue/apollo-composable'

const allTaskQueueQuery = gql`
  query Queue {
      adminQueueStats
    }
`
export function useAllTaskQueueQuery() {
  function getAllTaskQueue() {
    const { result, loading, refetch, onResult, error } = useQuery(allTaskQueueQuery)
    const empty = computed<boolean>(() => { return result?.value?.adminQueueStats?.length === 0 });
    const queues = computed<object[]>(() => result?.value?.adminQueueStats || [])
    return { queues, loading, empty, refetch, onResult, error }
  }
  return { getAllTaskQueue }
}


const jobQueueDataQuery = gql`
  query Queue($name: String!, $status: String!) {
    adminQueueJobsData(name: $name, status: $status){
      name,
      location,
      createdBy,
      timestamp,
      processedOn,
      data
      }
  }`
export function useJobLogsQuery() {
  function getJobLogs(name: string, status: string) {
    const { result, loading, refetch, onResult, error } = useQuery(jobQueueDataQuery, {
      name: name,
      status: status,
    })
    const empty = computed<boolean>(() => { return result?.value?.adminQueueJobsData.length === 0 });
    const jobLogs = computed<object[]>(() => result?.value?.adminQueueJobsData || [])
    return { jobLogs, loading, empty, refetch, onResult, error }
  }
  return { getJobLogs }
}