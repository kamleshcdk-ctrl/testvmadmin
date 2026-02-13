import { Temporal } from '@js-temporal/polyfill';
import { gql } from "graphql-tag";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client/core";
import type { NormalizedCacheObject } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import * as jose from 'jose';
import type { RuntimeConfig } from 'nuxt/schema';


interface AdminQueueJobsDataResult {
  name: string;
  location: string;
  createdBy: string;
  timestamp: string;
  processedOn: string;
  data: JobData;
}

interface Context {
  userId: string;
  locationId: string;
  tenantId: string;
  ipAddress: string;
}

interface JobData {
  locationId: string;
  context: Context;
}

export default defineTask({
  meta: {
    name: "send:job-status",
    description: "Validate and send job status alert for long running SyncIntegrations job",
  },
  async run() {
    // eslint-disable-next-line no-console
    console.log("Validate and send job status alert for long running SyncIntegrations job!");
    const config = useRuntimeConfig()
    const proxyUrl = `${config.public.DIRECT_GRAPHQL_URL}`;

    const httpLink = createHttpLink({
      uri: `${proxyUrl}/graphql`,
    });

    const secret = new TextEncoder().encode(
      config?.tailscaleSigningKey,
    )
    const alg = 'HS256'

    const data = {
      'X-Tailscale-Name': 'Cloudflare User',
      'X-Tailscale-Email': 'support@visitu.com',
    }

    const token = await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret)


    const authLink = setContext((_, { headers }) => {

      return {
        headers: {
          ...headers,
          'X-Tailscale-Token': token,
        }
      }
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    });

    const allowableRunHours = 9
    let sentAlert = false;
    let alertMessageBody = "";
    const jobs = await fetchAdminQueueJobs("SyncIntegrations", "active", client);

    // 1. Get the current time (instant)
    const now = Temporal.Now.instant();
    await Promise.all(
      jobs.map(async (job: AdminQueueJobsDataResult) => {
        const jobCreationTime = Temporal.Instant.from(job.processedOn);
        const duration: Temporal.Duration = jobCreationTime.until(now);
        const totalHoursDifference: number = duration.total({ unit: 'hours' });

        // Check if the processed time is greater than the time 9 hours from now
        const isProcessedOnGreaterThanNineHoursFromNow = totalHoursDifference > allowableRunHours;
        if (isProcessedOnGreaterThanNineHoursFromNow) {
          sentAlert = true;
          const tenantName = await fetchTenantName(job.data.context.tenantId, client);
          alertMessageBody += `The tenant '${tenantName}' (TenantId: ${job.data.context.tenantId}) SyncIntegrations job has been running continuously for ${Math.floor(totalHoursDifference)} hours. \n`;
          return;
        }
      })
    );

    if (sentAlert) {
      // eslint-disable-next-line no-console
      console.log("Send job status alert for long running SyncIntegrations job.");
      await sendAdminAlertMessage(`Job Running more than 9 Hours - Action Required`, alertMessageBody, client);
    }

    await writeAttendanceDelayAlert(config, client);
    await writeAttendanceActiveAlert(config, client);

    return { result: "Success" };
  }

})


async function writeAttendanceDelayAlert(config: RuntimeConfig, client: ApolloClient<NormalizedCacheObject>) {
  const WriteAttendenceJobs = await fetchAdminQueueJobs("WriteAttendance", "delayed", client);


  // Check WriteAttendance jobs - filter records delayed 9+ hours, then check if count meets threshold
  let sentWriteAttendenceAlert = false;
  let alertMessageBody = "";

  const allowableRunMinutes = Number(config.allowableJobRunMinutes) || 45;
  const minDelayedRecords = Number(config.minDelayedAttendanceRecords) || 30;
  const now = Temporal.Now.instant();

  // First, filter jobs that are delayed for more than allowable minutes
  const delayedJobs = WriteAttendenceJobs.filter((job: AdminQueueJobsDataResult) => {
    const jobCreationTime = Temporal.Instant.from(job.processedOn);
    const duration: Temporal.Duration = jobCreationTime.until(now);
    const totalMinutesDifference: number = duration.total({ unit: 'minutes' });
    return totalMinutesDifference > allowableRunMinutes;
  });

 
  // Only send alert if we have at least minDelayedRecords jobs delayed for allowableRunHours hours

  if (delayedJobs.length >= minDelayedRecords) {
    await Promise.all(
      WriteAttendenceJobs.map(async (job: AdminQueueJobsDataResult) => {
        const jobCreationTime = Temporal.Instant.from(job.processedOn);
        const duration: Temporal.Duration = jobCreationTime.until(now);
        const totalMinutesDifference: number = duration.total({ unit: 'minutes' });
        // Check if the processed time is greater than the time 9 hours from now
        const isProcessedStuck = totalMinutesDifference > allowableRunMinutes;

        if (isProcessedStuck) {
          sentWriteAttendenceAlert = true;
          const tenantName = await fetchTenantName(job.data.context.tenantId, client);
          alertMessageBody += `The tenant '${tenantName}' (TenantId: ${job.data.context.tenantId}) WriteAttendenceJobs job has been running continuously for ${Math.floor(totalMinutesDifference)} minutes. \n`;
          return;
        }
      })
    );
    if (sentWriteAttendenceAlert) {
      // eslint-disable-next-line no-console
      console.log(`Send job status alert for long running   WriteAttendance job. ${allowableRunMinutes} minutes ${delayedJobs.length} jobs , min records  ${minDelayedRecords} `);
      await sendAdminAlertMessage(`Job Running more than  ${allowableRunMinutes} Minutes - Action Required`, alertMessageBody, client);
    }

  }
}
async function writeAttendanceActiveAlert(config: RuntimeConfig, client: ApolloClient<NormalizedCacheObject>) {
  const WriteAttendenceJobs = await fetchAdminQueueJobs("WriteAttendance", "active", client);

  let sentWriteAttendenceAlert = false;
  let alertMessageBody = "";

  const allowableRunMinutes = Number(config.allowableJobRunMinutes) || 45;
  const now = Temporal.Now.instant();

  // First, filter jobs that are active for more than allowable minutes
  const activeJobs = WriteAttendenceJobs.filter((job: AdminQueueJobsDataResult) => {
    const jobCreationTime = Temporal.Instant.from(job.processedOn);
    const duration: Temporal.Duration = jobCreationTime.until(now);
    const totalMinutesDifference: number = duration.total({ unit: 'minutes' });
    return totalMinutesDifference > allowableRunMinutes;
  });
  // Only send alert if we have active long running jobs      
  if (activeJobs.length != 0) {
    await Promise.all(
      activeJobs.map(async (job: AdminQueueJobsDataResult) => {
        const jobCreationTime = Temporal.Instant.from(job.processedOn);
        const duration: Temporal.Duration = jobCreationTime.until(now);
        const totalMinutesDifference: number = duration.total({ unit: 'minutes' });
        const isProcessedStuck = totalMinutesDifference > allowableRunMinutes;

        if (isProcessedStuck) {
          sentWriteAttendenceAlert = true;
          const tenantName = await fetchTenantName(job.data.context.tenantId, client);
          alertMessageBody += `The tenant '${tenantName}' (TenantId: ${job.data.context.tenantId}) WriteAttendenceJobs job has been running continuously for ${Math.floor(totalMinutesDifference)} minutes. \n`;
          return;
        }
      })
    );
    if (sentWriteAttendenceAlert) {
      // eslint-disable-next-line no-console
      console.log(`Send job status alert for long running   WriteAttendance active job. ${allowableRunMinutes} minutes ${activeJobs.length} jobs`);
      await sendAdminAlertMessage(`Job Running more than  ${allowableRunMinutes} Minutes - Action Required`, alertMessageBody, client);
    }

  }
}

export async function fetchAdminQueueJobs(name: string, status: string, client: ApolloClient<NormalizedCacheObject>) {
  const { data } = await client.query({
    query: gql`
      query AdminQueueJobsData($name: String!, $status: String!) {
        adminQueueJobsData(name: $name, status: $status) {
          name
          location
          createdBy
          timestamp
          processedOn
          data
        }
      }
    `,
    variables: {
      name,
      status
    }
  });

  return data.adminQueueJobsData;
}

export async function sendAdminAlertMessage(
  messageTitle: string,
  messageText: string,
  client: ApolloClient<NormalizedCacheObject>
) {
  try {
    await client.mutate({
      mutation: gql`
        mutation AdminSendAlertMessage($messageTitle: String!, $messageText: String!) {
          adminSendAlertMessage(messageTitle: $messageTitle, messageText: $messageText)
        }
      `,
      variables: {
        messageTitle: messageTitle,
        messageText: messageText
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unexpected Error:', error);
  }
}

export async function fetchTenantName(id: string, client: ApolloClient<NormalizedCacheObject>) {
  const { data } = await client.query({
    query: gql`query AdminTenant($id: String!) {
      adminTenant(id: $id) {
        name
    }
    }
    `,
    variables: {
      id
    }
  });

  return data.adminTenant.name;
}
