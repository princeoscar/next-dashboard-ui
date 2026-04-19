import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Grade, Prisma } from "@prisma/client";
import Image from "next/image";

const GradeListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    // URL QUERY PARAMS CONDITION
    const query: Prisma.GradeWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        // Since 'level' is an Int, we search for exact matches or use a range
                        const searchTerm = parseInt(value);
                        if (!isNaN(searchTerm)) {
                            query.level = { equals: searchTerm };
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    const [data, count] = await prisma.$transaction([
        prisma.grade.findMany({
            where: query,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.grade.count({ where: query }),
    ]);

    const columns = [
        {
            header: "Grade Name",
            accessor: "name",
        },
        {
            header: "Level",
            accessor: "level",
            className: "hidden md:table-cell",
        },
        {
            header: "Actions",
            accessor: "action",
        },
    ];

    const renderRow = (item: Grade) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-rubixPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td className="hidden md:table-cell">{item.level}</td>
            <td>
                <div className="flex items-center gap-2">
                    {/* We use our FormModal here for Update and Delete */}
                    <FormModal table="grade" type="update" data={item} />
                    <FormModal table="grade" type="delete" id={item.id} />
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Grades</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-rubixYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-rubixYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {/* THIS OPENS YOUR GRADE FORM */}
                        <FormModal table="grade" type="create" />
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data} />
            {/* PAGINATION (You can add your Pagination component here) */}
        </div>
    );
};

export default GradeListPage;