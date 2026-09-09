import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import Image from "next/image";


const StreamListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}) => {

 const { userId, sessionClaims } = await auth();

const role = (sessionClaims?.metadata as any)?.role;
   
     const admin = await prisma.admin.findUnique({
       where: {
         clerkId: userId!,
       },
       select: {
         schoolId: true,
       },
     });
   
     if (!admin) {
  throw new Error("Admin not found.");
}

const schoolId = admin.schoolId;

if (!schoolId) {
  throw new Error("School not found.");
}
   

  const params = await searchParams;

  const page = params.page
    ? parseInt(params.page)
    : 1;

  const search = params.search;


  const query: Prisma.StreamWhereInput = {
     schoolId,
  };


  if(search){
    query.name = {
      contains: search,
      mode:"insensitive"
    };
  }


  const [streams,count] =
    await prisma.$transaction([

      prisma.stream.findMany({
        where:query,

        include:{

classes:{
orderBy:{
name:"asc"
}
}

},

        take:ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (page - 1),

        orderBy:{
          name:"asc"
        }
      }),


      prisma.stream.count({
        where:query
      })

    ]);




const columns=[
{
header:"Stream",
accessor:"name"
},

{
header:"Classes",
accessor:"classes"
},

...(role==="admin"
?
[
{
header:"Actions",
accessor:"action",
className:"text-center"
}
]
:[]
)

];




const renderRow = (item: any) => (
  <tr
    key={item.id}
    className="border-b border-slate-100 hover:bg-slate-50"
  >
    <td className="p-4 font-bold">
      {item.name}
    </td>

    <td className="p-4">
  {item.classes.length === 0 ? (
    <span className="text-slate-400 text-sm">
      No Classes
    </span>
  ) : (
    <div className="flex flex-wrap gap-2">
      {item.classes.map((cls: any) => (
        <span
          key={cls.id}
          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
        >
          {cls.name}
        </span>
      ))}
    </div>
  )}
</td>

    {role === "admin" && (
      <td className="p-4 text-center">
  <div className="flex items-center justify-center gap-2">
    <FormContainer
      table="stream"
      type="update"
      data={item}
    />

    <FormContainer
      table="stream"
      type="delete"
      id={item.id}
    />
  </div>
</td>
    )}
  </tr>
);


console.log(JSON.stringify(streams, null, 2));


return (

<div className="
bg-white
p-8
rounded-[2.5rem]
m-4
mt-0
border
border-slate-100
">


<div className="
flex
justify-between
items-center
mb-8
">


<div>

<h1 className="
text-2xl
font-black
uppercase
">
Streams
</h1>


<p className="
text-xs
text-slate-400
uppercase
">
Manage class streams
</p>

</div>




<div className="
flex
gap-3
">


<TableSearch />


{
role==="admin" &&

<FormContainer
table="stream"
type="create"
/>

}


</div>


</div>





<Table
columns={columns}
renderRow={renderRow}
data={streams}
/>


<Pagination
page={page}
count={count}
/>



</div>

);


};


export default StreamListPage;