import { apiSlice } from "../apiSlices";

const TICKET_URL = "/ticket";

export const ticketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: `${TICKET_URL}/dashboard`,
        method: "GET",
        credentials: "include",
      }),
    }),

    getAllTicket: builder.query({
      query: ({ strQuery, isTrashed, search }) => ({
        url: `${TICKET_URL}/?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    createTicket: builder.mutation({
      query: (data) => ({
        url: `${TICKET_URL}/create`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    duplicateTicket: builder.mutation({
      query: (id) => ({
        url: `${TICKET_URL}/duplicate/${id}`,
        method: "POST",
        body: {},
        credentials: "include",
      }),
    }),

    updateTicket: builder.mutation({
      query: (data) => ({
        url: `${TICKET_URL}/update/${data.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    trashTicket: builder.mutation({
      query: ({ id }) => ({
        url: `${TICKET_URL}/${id}`,
        method: "PUT",
        credentials: "include",
      }),
    }),

    createSubTicket: builder.mutation({
      query: ({ data, id }) => ({
        url: `${TICKET_URL}/create-subticket/${id}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAllTicketQuery,
  useCreateTicketMutation,
  useDuplicateTicketMutation,
  useUpdateTicketMutation,
  useTrashTicketMutation,
  useCreateSubTicketMutation,
} = ticketApiSlice;
