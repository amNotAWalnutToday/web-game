type Props = {
    unit: any
    setSelectedUnit: React.Dispatch<React.SetStateAction<any | undefined>> 
}

export default function CharacterCard({unit, setSelectedUnit}: Props) {
    return (
        <>
            <button 
                className="card flex-col" 
                onClick={() => setSelectedUnit(unit)}
            >
                <span>{unit.race}</span>
                {unit.hasArrived ? 'Available' : 'Moving'}
            </button>
        </>
    )
}
