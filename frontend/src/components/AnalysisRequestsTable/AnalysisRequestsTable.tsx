import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {formatDate} from "src/utils/utils.ts";
import CustomTable from "components/CustomTable";
import {T_AnalysisRequest} from "src/utils/types.ts";

export const AnalysisRequestsTable = ({calculationrequests}:{calculationrequests:T_AnalysisRequest[]}) => {
    const navigate = useNavigate()

    const handleClick = (calculationrequest_id) => {
        navigate(`/analysis_requests/${calculationrequest_id}`)
    }

    const statuses = {
        "DRAFT": "Черновик",
        "IN_PROGRESS": "В работе",
        "COMPLETED": "Завершен",
        "CANCELLED": "Отменён",
        "DELETED": "Удалён"
    }

    const columns = useMemo(
        () => [
            {
                Header: '№',
                accessor: 'id',
            },
            {
                Header: 'Статус',
                accessor: 'status',
                Cell: ({ value }) => statuses[value]
            },
            {
                Header: 'Дата создания',
                accessor: 'date_created',
                Cell: ({ value }) => formatDate(value)
            },
            
            {
                Header: 'Дата завершения',
                accessor: 'completion_date',
                Cell: ({ value }) => formatDate(value)
            }
        ],
        []
    )

    return (
        <CustomTable columns={columns} data={calculationrequests} onClick={handleClick}/>
    )
};