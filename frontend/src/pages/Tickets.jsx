import React, { useMemo, useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView, MdOutlineSearch } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import BoardView from "../components/BoardView";
import TicketTitle from "../components/TicketTitle";
import Table from "../components/ticket/Table";
import AddTicket from "../components/ticket/AddTicket";
import { useGetAllTicketQuery } from "../redux/slices/api/ticketApiSlice";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TICKET_TYPE = {
  todo: "bg-blue-600",
  inProgress: "bg-yellow-400",
  completed: "bg-green-600",
};

const Tickets = () => {
  const params = useParams();

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const status = params?.status || "";

  const { data, isLoading } = useGetAllTicketQuery({
    strQuery: status,
    isTrashed: "",
    search: "",
  });

  const filteredTickets = useMemo(() => {
    if (!data?.tickets) return [];
    return data.tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toString().includes(search)
    );
  }, [data, search]);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tickets` : "Tickets"} />

        <div className="flex items-center gap-4">
          <div className="w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6] border">
            <MdOutlineSearch className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800"
            />
          </div>

          {!status && (
            <Button
              onClick={() => setOpen(true)}
              label="Create Ticket"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
            />
          )}
        </div>
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            <TicketTitle label="To Do" className={TICKET_TYPE.todo} />
            <TicketTitle
              label="In Progress"
              className={TICKET_TYPE.inProgress}
            />
            <TicketTitle label="Completed" className={TICKET_TYPE.completed} />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView tickets={filteredTickets} />
        ) : (
          <div className="w-full">
            <Table tickets={filteredTickets} />
          </div>
        )}
      </Tabs>

      <AddTicket open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tickets;
