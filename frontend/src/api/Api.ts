/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AnalysisRequest {
  /** ID */
  id?: number;
  /** Owner */
  owner?: string;
  /** Moderator */
  moderator?: string;
  /** Artifacts */
  samples?: string;
  /** Статус */
  status?: 1 | 2 | 3 | 4 | 5;
  /**
   * Дата создания
   * @format date-time
   */
  date_created?: string | null;
  /**
   * Дата формирования
   * @format date-time
   */
  date_formation?: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  date_complete?: string | null;
  /**
   * Field
   * @min -2147483648
   * @max 2147483647
   */
  field?: number | null;
  /**
   * Success
   * @min -2147483648
   * @max 2147483647
   */
  success?: number | null;
}

export interface ArtifactAnalysisRequest {
  /** ID */
  id?: number;
  /**
   * Поле м-м
   * @min -2147483648
   * @max 2147483647
   */
  order?: number;
  /** Artifact */
  sample?: number | null;
  /** AnalysisRequest */
  calculationrequest?: number | null;
}

export interface UserLogin {
  /**
   * Username
   * @minLength 1
   */
  username?: string;
  /**
   * Password
   * @minLength 1
   */
  password?: string;
}

export interface UserRegister {
  /** ID */
  id?: number;
  /**
   * Адрес электронной почты
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Пароль
   * @minLength 1
   * @maxLength 128
   */
  password: string;
  /**
   * Имя пользователя
   * Обязательное поле. Не более 150 символов. Только буквы, цифры и символы @/./+/-/_.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
}

export interface UserProfile {
  /**
   * Username
   * @minLength 1
   */
  username?: string;
  /**
   * Email
   * @minLength 1
   */
  email?: string;
  /**
   * Password
   * @minLength 1
   */
  password?: string;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8000/api" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Snippets API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@snippets.local>
 *
 * Test description
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  calculationrequests = {
    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsList
     * @request GET:/analysis_requests/
     * @secure
     */
    calculationrequestsList: (
      query?: {
        status?: string;
        date_formation_start?: string;
        date_formation_end?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/analysis_requests/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsRead
     * @request GET:/analysis_requests/{calculationrequest_id}/
     * @secure
     */
    calculationrequestsRead: (calculationrequestId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/analysis_requests/${calculationrequestId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsDeleteDelete
     * @request DELETE:/analysis_requests/{calculationrequest_id}/delete/
     * @secure
     */
    calculationrequestsDeleteDelete: (calculationrequestId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/analysis_requests/${calculationrequestId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsDeleteArtifactDelete
     * @request DELETE:/analysis_requests/{calculationrequest_id}/delete_artifact/{sample_id}/
     * @secure
     */
    calculationrequestsDeleteArtifactDelete: (requestsId: string, artifactId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/analysis_requests/${requestsId}/delete_artifact/${artifactId}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsUpdateUpdate
     * @request PUT:/analysis_requests/{calculationrequest_id}/update/
     * @secure
     */
    calculationrequestsUpdateUpdate: (calculationrequestId: string, data: AnalysisRequest, params: RequestParams = {}) =>
      this.request<AnalysisRequest, any>({
        path: `/analysis_requests/${calculationrequestId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsUpdateArtifactUpdate
     * @request PUT:/analysis_requests/{calculationrequest_id}/update_artifact/{sample_id}/
     * @secure
     */
    calculationrequestsUpdateArtifactUpdate: (
      calculationrequestId: string,
      sampleId: string,
      data: ArtifactAnalysisRequest,
      params: RequestParams = {},
    ) =>
      this.request<ArtifactAnalysisRequest, any>({
        path: `/analysis_requests/${calculationrequestId}/update_artifact/${sampleId}/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsUpdateStatusAdminUpdate
     * @request PUT:/analysis_requests/{calculationrequest_id}/update_status_admin/
     * @secure
     */
    calculationrequestsUpdateStatusAdminUpdate: (calculationrequestId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/analysis_requests/${calculationrequestId}/update_status_admin/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags calculationrequests
     * @name AnalysisRequestsUpdateStatusUserUpdate
     * @request PUT:/analysis_requests/{calculationrequest_id}/update_status_user/
     * @secure
     */
    calculationrequestsUpdateStatusUserUpdate: (calculationrequestId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/analysis_requests/${calculationrequestId}/update_status_user/`,
        method: "PUT",
        secure: true,
        ...params,
      }),
  };
  samples = {
    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsList
     * @request GET:/artifacts/
     * @secure
     */
    samplesList: (
      query?: {
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/artifacts/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsCreateCreate
     * @request POST:/samples/create/
     * @secure
     */
    samplesCreateCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/samples/create/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsRead
     * @request GET:/samples/{sample_id}/
     * @secure
     */
    samplesRead: (sampleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/artifacts/${sampleId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsAddToAnalysisRequestCreate
     * @request POST:/artifacts/{sample_id}/add_to_analysis/
     * @secure
     */
    samplesAddToAnalysisRequestCreate: (sampleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/artifacts/${sampleId}/add_to_analysis/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsDeleteDelete
     * @request DELETE:/samples/{sample_id}/delete/
     * @secure
     */
    samplesDeleteDelete: (sampleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/samples/${sampleId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsUpdateUpdate
     * @request PUT:/samples/{sample_id}/update/
     * @secure
     */
    samplesUpdateUpdate: (sampleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/samples/${sampleId}/update/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags samples
     * @name ArtifactsUpdateImageCreate
     * @request POST:/samples/{sample_id}/update_image/
     * @secure
     */
    samplesUpdateImageCreate: (sampleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/samples/${sampleId}/update_image/`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     */
    usersLoginCreate: (data: UserLogin, params: RequestParams = {}) =>
      this.request<UserLogin, any>({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersRegisterCreate
     * @request POST:/users/register/
     * @secure
     */
    usersRegisterCreate: (data: UserRegister, params: RequestParams = {}) =>
      this.request<UserRegister, any>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersUpdateUpdate
     * @request PUT:/users/{user_id}/update/
     * @secure
     */
    usersUpdateUpdate: (userId: string, data: UserProfile, params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/users/${userId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
