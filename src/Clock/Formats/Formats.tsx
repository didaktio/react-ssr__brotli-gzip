import { SyntheticEvent } from "react";
import { formats, formatSeconds, TimeFormat } from "../helpers";
import './Formats.scss';


// Demonstration of 'lifting state': https://reactjs.org/docs/lifting-state-up.html.
// The onClick handler is provided by an ancestor (in this case, the Clock), making this component 'controlled'.
export const Formats = ({
    currentFormat,
    seconds,
    className,
    onClick
}: {
    currentFormat: TimeFormat;
    seconds: number;
    className?: string;
    onClick: (e: FormatsClickEvent) => any;
}) => (
    <div className={`Formats ${className ? `${className}` : ''}`}
        onClick={onClick as any}>

        {
            formats.map(x => x === currentFormat ? '' : (
                <div key={x} id={x} className="Formats__item">Show {x}

                    <span className="Formats__example">({formatSeconds(x, seconds)})</span>

                </div>
            ))
        }

    </div>
);


// Customise Synthetic Event
export interface FormatsClickEvent extends SyntheticEvent { target: FormatsItemElement; };
interface FormatsItemElement extends Omit<HTMLDivElement, 'id'> { id: TimeFormat; };