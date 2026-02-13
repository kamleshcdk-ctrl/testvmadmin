export interface IntegrationConfigProps {
  baseUrl: string
  yearId: string
  clientId: string
  clientSecret: string
  tenantDomain: string
  integrationType: IntegrationType
}

type IntegrationType = "powerschool" | "progressbook" | "facts" | "blackbaud" | "veracross" | "clever"

export interface PowerschoolPluginVersionResponse {
  success: boolean;
  error?: object;
  data?: boolean;
}

export interface IntegrationLocationResponse {
  success: boolean;
  count: number;
  error?: object;
  data?: ArrayLike<IntegrationLocation>;
}

export interface IntegrationLocation {
  id: number;
  schoolId: number;
  schoolNumber?: number;
  name: string;
  label?: string;
  location?: object;
}

export interface FactsIntegrationLocation {
  schoolCode?: string;
  schoolName: string;
}

export interface FactIntegrationConfig {
  baseUrl: string
  apiKey: string
  subscriptionKey: string
}

export interface IntegrationUserResponse {
  success: boolean;
  count: number;
  pages?: number;
  error?: object;
  data?: ArrayLike<IntegrationUser>;
}

export interface IntegrationUser {
  id: number;
  userType: string;
  name: string;
  locationId?: number;
  externalId?: string;
  birthdate?: string;
  email?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  photo?: Buffer;
  gradYear?: string;
  gradeLevel?: string;
  guardianIds?: string[];
  childIds?: string[];
  raw?: object;
}

export interface IntegrationUserScheduleResponse {
  success: boolean;
  count: number;
  error?: object;
  data?: StudentScheduleDay;
}

export interface PowerschoolDailyAttendance {
  attendance?: {
    att_comment: string;
    att_date: string;
    id: number;
  }
  attendance_code?: {
    att_code: string;
    description: string
  }
}
export interface PowerschoolClassMeetingAttendance {
  attendance: {
    att_comment: string;
    att_date: string;
    periodid: string;
    id: number;
  }
  attendance_code: {
    att_code: string;
    description: string
  }
}
export interface PowerschoolScheduleClassPeriod {
  comment: string;
  day: string;
  endTime: string;
  periodId: string;
  startTime: string;
  studentId: string;
}

export interface PowerschoolScheduleDay {
  hasBridgePeriod: boolean;
  bridgePeriodList: object;
  scheduleDay: object;
  scheduleClassPeriods: PowerschoolScheduleClassPeriod[];
  dailyAttendance: PowerschoolDailyAttendance;
  classMeetingAttendance: PowerschoolClassMeetingAttendance[];
}

export interface StudentScheduleDay {
  studentId: number;
  year: number;
  month: number;
  dayOfMonth: number;
  schoolLocation: number;
  found: boolean;
  hasClassPeriods: boolean;
  hasDailySchedule: boolean;
  numberOfClassPeriods?: number;
  rawPowerschool?: PowerschoolScheduleDay;
  swappedStudentId?: number;
  swappedStudentDcId: number;
  hasDailyCode: boolean;
  dailyCode: string;
  hasClassPeriodCodes: boolean;
}
export interface MergedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  syncId: string;
  syncHash: string;
  mergedData: string;
  rawSyncData: string;
  updatedAt: string;
  createdAt: string;
}
export interface UserWithMergedUser {
  name: string;
  syncId: string;
  mergedUserSyncIds: string[];
}
export interface VisituUser {
  // apollo properties
  id: string;
  name: string;
  firstAndLastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string | undefined;
  dateOfBirth: string | undefined;
  hasMobileApp: boolean;
  syncId: string;
  syncedAt: string;
  updatedAt: string;
  createdAt: string;
  syncHash: string;
  rawSyncData: string;
  rawSyncEmails: string[];
  rawSyncPhoneNumbers: string[];
  syncNotes: string[];
  syncProvider: string;
  mobileDeviceInfo: object;
  admin: boolean;
  roles: UserLocationRole[];

  childContacts: VisituUser[];
  parentContacts: VisituUser[];
  mergedUsers: MergedUser[];
  tenant: ApolloTenant;

  // added properties
  roleNames: string;
  roleLocationNames: string;

  hasPhone: boolean;
  hasEmail: boolean;
  phoneOrEmail: boolean;
  hasBirthDate: boolean;
  missingAll: boolean;

  hasParent: boolean;
  hasChild: boolean;
  hasParentOrChild: boolean;
  hasMergedUsers: boolean;

  guardianLinkCount: number;
  mergedUserCount: number;
  mergedUserSyncIds: string;
}

export interface UserLocationRole {
  id: string;
  name: string;
  location: TenantLocation;
  integrationRoleIds: string[];
}

export interface TenantLocation {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
}

export interface LocationUserCount {
  id: string;
  name: string;
  count: number;
}

export interface MergeableUserPair {
  targetUser: {
    id?: string | undefined;
    found_name?: string | undefined;
    name: string;
    syncId: string;
  };
  mergedUser: {
    id?: string | undefined;
    found_name?: string | undefined;
    name?: string;
    syncId: string;
  };
  index?: number;
  merged?: boolean;
}
