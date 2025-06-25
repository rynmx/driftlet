import type { Metadata } from "next";
import CreatePostForm from "@/components/CreatePostForm";

export const metadata: Metadata = {
  title: "create post",
};

const CreatePostPage = () => {
  return <CreatePostForm />;
};

export default CreatePostPage;
