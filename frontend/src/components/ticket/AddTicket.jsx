import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../utils/firebase";
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from "../../redux/slices/api/ticketApiSlice";
import { toast } from "sonner";
import { dateFormatter } from "../../utils";
import { useSelector } from "react-redux";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const uploadedFileURLs = [];

const AddTicket = ({ open, setOpen, ticket }) => {
  const defaultValues = {
    title: ticket?.title || "",
    date: dateFormatter(ticket?.date || new Date()),
    stage: ticket?.stage || "",
    priority: ticket?.priority || "",
    assets: [],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const { user } = useSelector((state) => state.auth);

  const [team, setTeam] = useState(ticket?.team || []);
  const [stage, setStage] = useState(ticket?.stage?.toUpperCase() || LISTS[0]);
  const [priority, setPriority] = useState(
    ticket?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const URLS = ticket?.assets ? [...ticket.assets] : [];

  const submitHandler = async (data) => {
    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.log("Error uploading file:", error.message);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };

      const res = ticket?.id
        ? await updateTicket({
            ...newData,
            id: ticket.id,
            updated_by: user?.name,
          })
        : await createTicket(newData).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  // const uploadFile = async (file) => {
  //   const storage = getStorage(app);

  //   const name = new Date().getTime() + file.name;
  //   const storageRef = ref(storage, name);

  //   const uploadTicket = uploadBytesResumable(storageRef, file);

  //   return new Promise((resolve, reject) => {
  //     uploadTicket.on(
  //       "state_changed",
  //       (snapshot) => {
  //         console.log("uploading");
  //       },
  //       (error) => {
  //         reject(error);
  //       },
  //       () => {
  //         getDownloadURL(uploadTicket.snapshot.ref)
  //           .then((downloadURL) => {
  //             uploadedFileURLs.push(downloadURL);
  //             resolve();
  //           })
  //           .catch((error) => {
  //             reject(error);
  //           });
  //       }
  //     );
  //   });
  // };

  const uploadFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target.result; // Base64 Data URL

        // Save the image to localStorage with a unique key
        const fileKey = `uploaded_image_${Date.now()}`;
        localStorage.setItem(fileKey, fileData);

        // Create a retrievable local URL
        const fileURL = `/local-storage/${fileKey}`;
        uploadedFileURLs.push(fileURL);
        resolve(fileURL);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {ticket ? "UPDATE ticket" : "ADD Ticket"}
          </Dialog.Title>

          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Ticket Title"
              type="text"
              name="title"
              label="Ticket Title"
              className="w-full rounded"
              register={register("title", { required: "Title is required" })}
              error={errors.title ? errors.title.message : ""}
            />

            <UserList setTeam={setTeam} team={team} />

            <div className="flex gap-4">
              <SelectList
                label="Ticket Stage"
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <div className="w-full">
                <Textbox
                  placeholder="Date"
                  type="date"
                  name="date"
                  label="Ticket Date"
                  className="w-full rounded"
                  register={register("date", {
                    required: "Date is required!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <SelectList
                label="Priority Level"
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className="w-full flex items-center justify-center mt-4">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    onChange={(e) => handleSelect(e)}
                    accept=".jpg, .png, .jpeg"
                    multiple={true}
                  />
                  <BiImages />
                  <span>
                    {assets.length > 0
                      ? `${assets.length} file(s) selected`
                      : "Add Assets"}
                  </span>
                </label>
              </div>
            </div>

            <div className="py-6 sm:flex sm:flex-row-reverse gap-4">
              {uploading ? (
                <span className="text-sm py-2 text-red-500">
                  Uploading assets
                </span>
              ) : (
                <Button
                  label="Submit"
                  type="submit"
                  className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                />
              )}

              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTicket;
