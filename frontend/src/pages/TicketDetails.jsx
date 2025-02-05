import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "../components/Tabs";
import { PRIOTITYSTYELS, TICKET_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";
import {
  useGetTicketByIdQuery,
  usePostActivityMutation,
  useTrashTicketMutation,
} from "../redux/slices/api/ticketApiSlice";
import AddTicket from "../components/ticket/AddTicket";
import ConfirmatioDialog from "../components/Dialogs";
import { ClipboardCheck, ClipboardCopy } from "lucide-react";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Ticket Detail", icon: <FaTasks /> },
  // { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TICKETTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />,
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const TicketDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetTicketByIdQuery(id);

  const navigate = useNavigate();

  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [copied, setCopied] = useState(false);

  const [deleteTicket] = useTrashTicketMutation();

  const [selected, setSelected] = useState(0);
  // const ticket = tickets[3];
  const ticket = data?.ticket;

  if (isLoading) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }

  const deleteClicks = () => {
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteTicket({
        id: ticket.id,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);

      navigate("/tickets");
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleCopy = () => {
    if (!ticket?.id) return;
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{ticket?.title}</h1>

      <Tabs tabs={TABS} setSelected={setSelected}>
        <div className="flex gap-2 md:gap-4 justify-end px-1">
          <Button
            className="text-blue-600 hover:text-blue-500 sm:px-0 text-sm md:text-base"
            label="Edit"
            type="button"
            onClick={() => setOpenEdit(true)}
          />

          <Button
            className="text-red-700 hover:text-red-500 sm:px-0 text-sm md:text-base"
            label="Delete"
            type="button"
            onClick={() => deleteClicks(ticket?.id)}
          />
        </div>
        {selected === 0 ? (
          <>
            <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
              {/* LEFT */}
              <div className="w-full md:w-1/2 space-y-8">
                <div className="flex items-center gap-5">
                  <div
                    className={clsx("flex items-center gap-2 cursor-pointer")}
                    onClick={handleCopy}
                  >
                    <span className="text-black uppercase">
                      Tid: #{ticket?.id}
                    </span>
                    {copied ? (
                      <ClipboardCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClipboardCopy className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[ticket?.priority],
                      bgColor[ticket?.priority]
                    )}
                  >
                    <span className="text-lg">{ICONS[ticket?.priority]}</span>
                    <span className="uppercase">
                      {ticket?.priority} Priority
                    </span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full",
                        TICKET_TYPE[ticket?.stage]
                      )}
                    />
                    <span className="text-black uppercase">
                      {ticket?.stage}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500">
                  Created At: {new Date(ticket?.date).toDateString()}
                </p>

                <div className="flex items-center gap-8 p-4 border-y border-gray-200">
                  <div className="space-x-2">
                    <span className="font-semibold">Assets :</span>
                    <span>{ticket?.assets?.length}</span>
                  </div>

                  {/* <span className="text-gray-400">|</span> */}

                  {/* <div className="space-x-2">
                    <span className="font-semibold">Sub-Ticket :</span>
                    <span>{ticket?.subTickets?.length}</span>
                  </div> */}
                </div>

                <div className="space-y-4 py-6">
                  <p className="text-gray-600 font-semibold test-sm">
                    TICKET TEAM
                  </p>
                  <div className="space-y-3">
                    {ticket?.team?.map((m, index) => (
                      <div
                        key={index}
                        className="flex gap-4 py-2 items-center border-t border-gray-200"
                      >
                        <div
                          className={
                            "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                          }
                        >
                          <span className="text-center">
                            {getInitials(m?.name)}
                          </span>
                        </div>

                        <div>
                          <p className="text-lg font-semibold">{m?.name}</p>
                          <span className="text-gray-500">{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  {/* <p className="text-gray-500 font-semibold text-sm">
                    SUB-TICKETS
                  </p>
                  <div className="space-y-8">
                    {ticket?.subTickets?.map((el, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50-200">
                          <MdTaskAlt className="text-violet-600" size={26} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-500">
                              {new Date(el?.date).toDateString()}
                            </span>

                            <span className="px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold">
                              {el?.tag}
                            </span>
                          </div>

                          <p className="text-gray-700">{el?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div> */}
                </div>
              </div>
              {/* RIGHT */}
              <div className="w-full md:w-1/2 space-y-8">
                <p className="text-lg font-semibold">ASSETS</p>

                <div className="w-full grid grid-cols-2 gap-4">
                  {ticket?.assets?.map((el, index) => {
                    const fileKey = el.replace("/local-storage/", "");
                    const imageData = localStorage.getItem(fileKey);

                    return imageData ? (
                      <img
                        key={index}
                        src={imageData}
                        alt={ticket?.title}
                        className="w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50"
                      />
                    ) : (
                      <span key={index} className="text-red-500">
                        Image not found
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Activities activity={ticket?.activities} id={id} />
          </>
        )}
      </Tabs>

      <AddTicket
        open={openEdit}
        setOpen={setOpenEdit}
        ticket={ticket}
        key={new Date().getTime()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </div>
  );
};

const Activities = ({ activity, id }) => {
  const [selected, setSelected] = useState(act_types[0]);
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostActivityMutation();
  const handleSubmit = async () => {};

  const Card = ({ item }) => {
    return (
      <div className="flex space-x-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {TICKETTYPEICON[item?.type]}
          </div>
          <div className="w-full flex items-center">
            <div className="w-0.5 bg-gray-300 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 mb-8">
          <p className="font-semibold">
            {/* {item?.by?.name} */}
            {"Dhanu"}
          </p>
          <div className="text-gray-500 space-y-2">
            <span className="capitalize">{item?.type}</span>
            <span className="text-sm">{moment(item?.date).fromNow()}</span>
          </div>
          <div className="text-gray-700">{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto">
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Activities</h4>

        <div className="w-full">
          {activity?.map((el, index) => (
            <Card
              key={index}
              item={el}
              isConnected={index < activity.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">
          Add Activity
        </h4>
        <div className="w-full flex flex-wrap gap-5">
          {act_types.map((item, index) => (
            <div key={item} className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selected === item ? true : false}
                onChange={(e) => setSelected(item)}
              />
              <p>{item}</p>
            </div>
          ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type ......"
            className="bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
          ></textarea>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="button"
              label="Submit"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
