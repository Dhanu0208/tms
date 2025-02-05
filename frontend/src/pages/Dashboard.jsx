import React, { useState } from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineEdit,
  MdOutlineSearch,
} from "react-icons/md";
import { FaNewspaper } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import clsx from "clsx";
import { BGS, PRIOTITYSTYELS, TICKET_TYPE } from "../utils";
import UserInfo from "../components/UserInfo";
import { useGetDashboardStatsQuery } from "../redux/slices/api/ticketApiSlice";
import Loading from "../components/Loader";

const TicketTable = ({ tickets }) => {
  const [search, setSearch] = useState("");

  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const filteredTickets = tickets?.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toString().includes(search)
  );

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2 pr-4">Id</th>
        <th className="py-2">Ticket Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Team</th>
        <th className="py-2">Description</th>
        <th className="py-2">Created At</th>
        <th className="py-2">Last Updated At</th>
        <th className="py-2">Last Updated By</th>
      </tr>
    </thead>
  );

  const TableRow = ({ ticket }) => (
    <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
      <td className="py-2 pr-4">
        <p className="text-base text-black">#{ticket.id}</p>
      </td>

      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TICKET_TYPE[ticket.stage])}
          />

          <p className="text-base text-black">{ticket.title}</p>
        </div>
      </td>

      <td className="py-2">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[ticket.priority])}>
            {ICONS[ticket.priority]}
          </span>
          <span className="capitalize">{ticket.priority}</span>
        </div>
      </td>

      <td className="py-2">
        <div className="flex">
          {ticket?.team?.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>
      <td className="py-2">
        <span className="text-base text-gray-600">
          {ticket?.description ? ticket.description : "Ticket created"}
        </span>
      </td>

      <td className="py-2">
        <span className="text-base text-gray-600">
          {moment(ticket?.date).fromNow()}
        </span>
      </td>
      <td className="py-2">
        <span className="text-base text-gray-600">
          {moment(ticket?.updated_at).fromNow()}
        </span>
      </td>
      <td className="py-2">
        <span className="text-base text-gray-600">
          {ticket?.updated_by ? ticket?.updated_by : "-"}
        </span>
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full h-screen bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-black font-semibold">History</h2>

          <div className="w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6]">
            <MdOutlineSearch className="text-gray-500 text-xl" />

            <input
              type="text"
              placeholder="Search...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800"
            />
          </div>
        </div>
        <table className="w-full">
          <TableHeader />
          <tbody>
            {filteredTickets?.length > 0 ? (
              filteredTickets?.map((ticket, id) => (
                <TableRow key={id} ticket={ticket} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500">
                  No tickets available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

const Dashboard = () => {
  const { data: summary, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }

  const totals =
    summary?.groupedByStage?.reduce((acc, item) => {
      acc[item.stage] = item.count;
      return acc;
    }, {}) || {};

  const stats = [
    {
      _id: "1",
      label: "TOTAL TICKET",
      total: summary?.totalTickets || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLETED TICKET",
      total: totals["completed"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TICKET IN PROGRESS",
      total: totals["in progress"] || 0,
      icon: <MdOutlineEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODOS",
      total: totals["todo"] || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
    },
  ];

  const Card = ({ label, count, bg, icon }) => {
    return (
      <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
        <div className="h-full flex flex-1 flex-col justify-between">
          <p className="text-base text-gray-600">{label}</p>
          <span className="text-2xl font-semibold">{count}</span>
        </div>

        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            bg
          )}
        >
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div classNamee="h-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>

      <div className="flex justify-center py-8">
        <TicketTable tickets={summary?.history} />
      </div>
    </div>
  );
};

export default Dashboard;
