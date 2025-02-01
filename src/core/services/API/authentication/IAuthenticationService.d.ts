// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:30:37"
//

/*
 * # -*- coding: utf-8 -*-
 * # Copyright (C) 2024 HRForce
 * #
 * # All rights reserved.
 * # @link hrforce.ai
 * #
 */

interface IInforUser {
    dateOfBirth?: string
    gender?: string
    name?: string
    phone?: string
    country?: string
    city?: string
    avatar?: any
    action?: string
    prefer_language?: string
}
interface ICreateTemplate {
    template: ITemplate
    id?: string
}
interface IDuplicateResumeTemplateRequest {
    resumeId?: string
}
interface IDeleteResumeTemplateRequest {
    resumeId?: string
}
interface IUpdateResumeTemplateRequest {
    id?: string
    name?: string
}
interface ISearchResumesTemplateRequest {
    name?: string
    limit?: number
    page?: number
    order?: 'updated_at' | 'created_at' | 'name'
}
interface IGetOneResumeTemplateRequest {
    slug?: string | undefined
}
interface IGetAllSectionsResponse {
    type?: string
    title?: string
    previewImage?: {
        en: string
        vi: string
    }
}
interface IUpdateCompanyProfileRequest {
    name?: string
    field?: string
    about?: string
    websiteLink?: string
    address?: string
    country?: string
    states?: { name: string; code: string }
    logo?: any
    coverPhoto?: any
    action?: string
    facebookLink?: string
    githubLink?: string
    linkedinLink?: string
    behanceLink?: string
    deleteIndexVideo?: number
    video_url?: string
    deleteIndexImage?: number
    images?: any
    email?: string
}

interface ISignupEmailRequest {
    email: string
    accountType: 'candidate' | 'employer'
    invitationToken?: string | null
}

interface ISocialAuthRequest {
    type: 'facebook' | 'google' | 'linkedin'
    accountType: 'candidate' | 'employer'
    accessToken?: string
    endpoint?: string
    is_signup?: boolean
    invitationToken?: string | null
}

interface IGetAllJobRequest {
    page?: number
    limit?: number
    params?: string
}

interface IGetOneJobRequest {
    id_type: 'slug' | 'id'
    value: string
}

interface IGetCompanyJobRequest {
    companyId: string
    jobId: string
}

interface IGetRecommendJobRequest {
    jobId: string
    type: 'industry' | 'company'
}

interface IGetAllSavedJobRequest {
    page?: number
    limit?: number
    params?: string
}
interface IsSavedJobRequest {
    jobId: string
}

interface IJobAttribute {
    types?:
        | 'employee-types'
        | 'working-types'
        | 'currency'
        | 'experience-levels'
        | 'experience-years'
}

interface IgetCompanyLocationRequest {
    name?: string
    deleted?: boolean
    page?: number
    limit?: number
}

interface ICreateCompanyLocationRequest {
    name?: string
    addr1?: string
    locationCode?: string
    locationPhoneNumber?: string
    locationEmailAddress?: string
    country?: string
    states?: {
        code?: string
        name?: string
    }
    city?: string
}
interface IUpdateCompanyLocationRequest {
    name?: string
    addr1?: string
    locationCode?: string
    locationPhoneNumber?: string
    locationEmailAddress?: string
    country?: string
    states?: {
        code?: string
        name?: string
    }
    city?: string
    id?: string
}

interface IGetOneCompanyLocationRequest {
    id: string
}

interface ICreateJobTemplateRequest {
    title?: string
    employeeType?: string
    industry?: string
    description?: string
    benefits?: string
    salaryCurrency?: string
    isSalaryCompetitive?: boolean
    minSalary?: number
    maxSalary?: number
    experienceLevel?: string
    experienceYears?: string
    genderPreference?: string
    agePreference?: string
    workingType?: string
}

interface IPostApplyJobRequest {
    name?: string
    phone?: string
    cover_letter?: string
    resume?: any
    resume_url?: string
    resume_name?: string
}

interface IGetAllAppliedJobRequest {
    page?: number
    limit?: number
    params?: string
}

interface IDeleteJobTemplateRequest {
    id?: string
}

interface IUpdateJobTemplateRequest {
    job?: ICreateJobTemplateRequest
    id?: string
}

interface ISearchJobTemplateRequest {
    title?: string
    limit?: number
    page?: number
    industry?: string | number
}

interface IPostJobFamilyRequest {
    name?: string
}

interface ICreateJobRequest {
    title?: string
    employeeType?: string
    industry?: string
    description?: string
    salaryCurrency?: string
    isSalaryCompetitive?: boolean
    minSalary?: number
    maxSalary?: number
    experienceLevel?: string
    experienceYears?: string
    genderPreference?: string
    agePreference?: string
    workingType?: string
    applyDueDate?: string
    jobFamilyId?: string
    locations?: string[]
    benefits?: string
    is_published?: boolean
}

interface IGetHiringStatsRequest {
    start_date?: string
    end_date?: string
    locations?: string[]
    family?: string
    limit?: number
    page?: number
    params?: string
}

interface IGetJobFamilyRequest {
    name?: string
    deleted?: boolean
    limit?: number
    page?: number
}

interface IUpdateJobFamilyRequest {
    id?: string
    name?: string
}

interface IDeleteJobFamilyRequest {
    id?: string
}

interface IGetAllByJobFamilyRequest {
    id?: string
    page?: number
    limit?: number
}

interface ISearchJobFamiliesRequest {
    limit?: number
    page?: number
    deleted?: boolean
    name?: string
}

interface IUpdateJobRequest {
    id?: string
    title?: string
}

interface IDeleteJobRequest {
    id?: string
}

interface IGetOneJobEmployerRequest {
    id?: string
}

interface IUpdateJobEmployerRequest {
    data?: any
    id?: string
}
interface IUploadImageRequest {
    previewImageFile?: any
    action?: 'update' | 'delete'
    photoFile?: any
    id?: string
}

interface IdownloadPDFeRequest {
    id?: string
    content?: any
}

interface IGetPublishedJobCompanyRequest {
    companyId?: string
    limit?: number
    page?: number
}

interface ISearchResumesCandidateRequest {
    name?: string
    limit?: number
    page?: number
    order?: 'updated_at' | 'created_at' | 'name'
}

interface IImportResumeRequest {
    file_pdf?: any
    linkedin_url?: string
}

interface IPostJobReportRequest {
    job?: string
    option?: number
    description?: string
}

interface IGetAllJobIndustryRequest {
    key?: number
    name?: string
    total_jobs?: number
}

interface IGetAllCompanyRequest {
    page?: number
    limit?: number
    params?: string
}

interface IGenDescBenefitJobRequest {
    title: string
    workingType: string
    experienceLevel: string
}

interface ICreateSuportContactRequest {
    email: string
    title: string
    content: string
    attachmentFiles?: any
}

interface IAuthentication {
    signupEmail({ email, accountType }: ISignupEmailRequest): Promise<any>
    activeEmail({
        email,
        token,
    }: {
        email: string
        token: string
    }): Promise<any>
    setPassword({
        email,
        token,
        password,
    }: {
        email: string
        token: string
        password: string
    }): Promise<any>
}
