import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchAnalysisRequests, T_calculationrequestsFilters, updateFilters} from "src/store/slices/analisisrequestsSlice";
import {Button, Col, Container, Form, Input, Row} from "reactstrap";
import {AnalysisRequestsTable} from "components/AnalysisRequestsTable/AnalysisRequestsTable.tsx";
import {useNavigate} from "react-router-dom";
import CustomDropdown from "components/CustomDropdown/CustomDropdown.tsx";

export const AnalysisRequestsPage = () => {

    const dispatch = useAppDispatch()

    const calculationrequests = useAppSelector((state) => state.calculationrequests.calculationrequests)

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const filters = useAppSelector<T_calculationrequestsFilters>((state) => state.calculationrequests.filters)

    const navigate = useNavigate()

    const [status, setStatus] = useState(filters.status)

    const [dateFormationStart, setDateFormationStart] = useState(filters.date_formation_start)

    const [dateFormationEnd, setDateFormationEnd] = useState(filters.date_formation_end)

    const statusOptions = {
        "": "Любой",
        "DRAFT": "Черновик",
        "IN_PROGRESS": "В работе",
        "COMPLETED": "Завершен",
        "CANCELLED": "Отклонен"
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/403/")
        }
    }, [isAuthenticated]);

    useEffect(() => {
        dispatch(fetchAnalysisRequests())
    }, []);

    const applyFilters = async (e) => {
        e.preventDefault()

        const filters:T_calculationrequestsFilters = {
            status: status,
            date_formation_start: dateFormationStart,
            date_formation_end: dateFormationEnd
        }

        await dispatch(updateFilters(filters))
        await dispatch(fetchAnalysisRequests())
    }

    return (
        <Container>
            <Form onSubmit={applyFilters}>
                <Row className="mb-4 d-flex align-items-center">
                    <Col md="2" className="d-flex flex-row gap-3 align-items-center">
                        <label>От</label>
                        <Input type="date" value={dateFormationStart} onChange={(e) => setDateFormationStart(e.target.value)} required/>
                    </Col>
                    <Col md="2" className="d-flex flex-row gap-3 align-items-center">
                        <label>До</label>
                        <Input type="date" value={dateFormationEnd} onChange={(e) => setDateFormationEnd(e.target.value)} required/>
                    </Col>
                    <Col md="3">
                        <CustomDropdown label="Статус" selectedItem={status} setSelectedItem={setStatus} options={statusOptions} />
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button color="primary" type="submit">Применить</Button>
                    </Col>
                </Row>
            </Form>
            {calculationrequests.length ? <AnalysisRequestsTable calculationrequests={calculationrequests}/> : <h3 className="text-center mt-5">Заявки не найдены</h3>}
        </Container>
    )
};