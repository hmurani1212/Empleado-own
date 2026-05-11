import { Noticesinstancemodule } from "../../../base"

const empNoticesApi = {
    /**
     * Shared notices for employee — all query keys sent via axios `params` (query string).
     * month/year are included only when both are provided (matches employee notices UI).
     */
    getEmpNoticesData: function (filters = {}) {
        const page =
            filters.page != null && filters.page !== ""
                ? Number(filters.page)
                : 1
        const limit =
            filters.limit != null && filters.limit !== ""
                ? Number(filters.limit)
                : 15

        const params = {
            action: "shared",
            page,
            limit,
        }

        const month =
            filters.month != null && filters.month !== ""
                ? String(filters.month)
                : ""
        const year =
            filters.year != null && filters.year !== ""
                ? String(filters.year)
                : ""

        if (month && year) {
            params.month = month
            params.year = year
        }

        return Noticesinstancemodule.request({
            method: "GET",
            url: `/api/v1/notices`,
            params,
        })
    },
}

export default empNoticesApi
