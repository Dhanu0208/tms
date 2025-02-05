import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TICKET_TYPE, formatDate } from "../utils";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import UserInfo from "./UserInfo";
import { IoMdAdd } from "react-icons/io";
import TicketDialog from "./ticket/TicketDialog";
import AddSubTicket from "./ticket/AddSubTicket";
import { useNavigate } from "react-router-dom";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TicketCard = ({ ticket }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <div
        className="w-full h-fit bg-white shadow-md p-4 rounded cursor-pointer"
        onClick={() => navigate(`/tickets/${ticket.id}`)}
      >
        <div className="w-full flex justify-between">
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[ticket?.priority]
            )}
          >
            <span className="text-lg">{ICONS[ticket?.priority]}</span>
            <span className="uppercase">{ticket?.priority} Priority</span>
          </div>

          {user?.isAdmin && <TicketDialog ticket={ticket} />}
        </div>

        <>
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "w-4 h-4 rounded-full",
                TICKET_TYPE[ticket.stage]
              )}
            />
            <h4 className="line-clamp-1 text-black">{ticket?.title}</h4>
          </div>
          <span className="text-sm text-gray-600">
            {formatDate(new Date(ticket?.date))}
          </span>
        </>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* <div className="flex gap-1 items-center text-sm text-gray-600">
              <BiMessageAltDetail />
              <span>{ticket?.activities?.length}</span>
            </div> */}
            <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <MdAttachFile />
              <span>{ticket?.assets?.length}</span>
            </div>
            {/* <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <FaList />
              <span>0/{ticket?.subTickets?.length}</span>
            </div> */}
          </div>

          <div className="flex flex-row-reverse">
            {ticket?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS?.length]
                )}
              >
                <UserInfo user={m} />
              </div>
            ))}
          </div>
        </div>
        {/* <div className="w-full border-b border-gray-200 my-2" /> */}

        {/* sub tickets */}
        {/* {ticket?.subTickets?.length > 0 ? (
          <div className="py-4">
            <h5 className="text-base line-clamp-1 text-black">
              {ticket?.subTickets[0].title}
            </h5>

            <div className="p-4 space-x-8">
              <span className="text-sm text-gray-600">
                {formatDate(new Date(ticket?.subTickets[0]?.date))}
              </span>
              <span className="bg-blue-600/10 px-3 py-1 rounded0full text-blue-700 font-medium">
                {ticket?.subTickets[0].tag}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="py-4">
              <span className="text-gray-500">No Sub Tickets</span>
            </div>
          </>
        )} */}

        {/* <div className="w-full pb-2">
          <button
            onClick={() => setOpen(true)}
            disabled={user.isAdmin ? false : true}
            className="w-full flex gap-4 items-center text-sm text-gray-500 font-semibold disabled:cursor-not-allowed disabled::text-gray-300"
          >
            <IoMdAdd className="text-lg" />
            <span>ADD SUBTICKETS</span>
          </button>
        </div> */}
      </div>

      <AddSubTicket open={open} setOpen={setOpen} id={ticket.id} />
    </>
  );
};

export default TicketCard;
