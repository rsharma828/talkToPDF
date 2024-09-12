import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  // api endpoint to ask questions to pdf
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = db.file.findFirst({
    where:{
        id:fileId,
        userId,
    },
  })

  if(!file){
    return new Response('NOT FOUND',{status:404})
  }

  await db.message.create({
    data:{
      text:message,
      isUserMessage:true,
      userId,
      fileId
    },
  })

  //   

};
