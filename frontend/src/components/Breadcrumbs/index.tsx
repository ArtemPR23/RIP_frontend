import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {T_Artifact} from "modules/types.ts";

interface Props {
    selectedArtifact: T_Artifact | null
}

const Breadcrumbs = ({ selectedArtifact }: Props) => {

    const location = useLocation()

    return (
        <Breadcrumb className="fs-5">
			{location.pathname == "/" &&
				<BreadcrumbItem>
					<Link to="/">
						Главная
					</Link>
				</BreadcrumbItem>
			}
			{location.pathname.includes("/artifacts") &&
                <BreadcrumbItem active>
                    <Link to="/artifacts">
						Артефакты
                    </Link>
                </BreadcrumbItem>
			}
            {selectedArtifact &&
                <BreadcrumbItem active>
                    <Link to={location.pathname}>
                        { selectedArtifact.title }
                    </Link>
                </BreadcrumbItem>
            }
			<BreadcrumbItem />
        </Breadcrumb>
    );
};

export default Breadcrumbs