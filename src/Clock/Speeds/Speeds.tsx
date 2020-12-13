import { SyntheticEvent } from "react"
import { Speed, speeds } from "../helpers"
import './Speeds.scss';


// Creating the callback outside of the html (to avoid re-creation) is not necessary because the function
// is provided as a prop.
export const Speeds = ({
    currentSpeed,
    className,
    onClick
}: {
    currentSpeed: string;
    className?: string;
    onClick: (e: SpeedsClickEvent) => any;
}) => (
    <div className={`Speeds ${className ? `${className}` : ''}`}
        onClick={onClick as any}>

        <div className="Speeds__header">
            Speed
        </div>
        {
            speeds.map(x => (
                <div
                    key={x}
                    id={x}
                    className="Speeds__item" >
                    {x}{x === currentSpeed ? <span className="Speeds__item-checkmark">&#x2713;</span> : ''}
                </div>
            ))
        }

    </div >
)


// Customise Synthetic Event
export interface SpeedsClickEvent extends SyntheticEvent { target: SpeedsItemElement; };
interface SpeedsItemElement extends Omit<HTMLDivElement, 'id'> { id: Speed; };