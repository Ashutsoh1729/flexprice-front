import MultiSelect from '@/components/atoms/MultiSelect';
import { cn } from '@/lib/utils';
import Feature, { FEATURE_TYPE } from '@/models/Feature';
import FeatureApi from '@/api/FeatureApi';
import { useQuery } from '@tanstack/react-query';
import { Gauge, SquareCheckBig, Wrench } from 'lucide-react';
import { FC } from 'react';

const fetchFeatures = async () => {
	return await FeatureApi.getAllFeatures({
		status: 'published',
	});
};

interface Props {
	onChange: (values: Feature[]) => void;
	values?: string[];
	error?: string;
	label?: string;
	placeholder?: string;
	description?: string;
	className?: string;
	disabledFeatures?: string[];
}

const getFeatureIcon = (featureType: string) => {
	const className = 'size-4 opacity-80 text-muted-foreground';
	if (featureType === FEATURE_TYPE.BOOLEAN) {
		return <SquareCheckBig className={className} />;
	} else if (featureType === FEATURE_TYPE.METERED) {
		return <Gauge className={className} />;
	} else if (featureType === FEATURE_TYPE.STATIC) {
		return <Wrench className={className} />;
	}
};

const FeatureMultiSelect: FC<Props> = ({
	onChange,
	values = [],
	error,
	label: _label = 'Features',
	placeholder = 'Select features',
	description,
	className,
	disabledFeatures,
}) => {
	const {
		data: featuresData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['fetchFeatures2'],
		queryFn: fetchFeatures,
	});

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Error</div>;
	}

	if (!featuresData) {
		return <div>No Features found</div>;
	}

	const options = featuresData.items
		.map((feature: Feature) => ({
			value: feature.id,
			label: feature.name,
			icon: () => getFeatureIcon(feature.type),
		}))
		.sort((a, b) => {
			const aDisabled = disabledFeatures?.includes(a.value);
			const bDisabled = disabledFeatures?.includes(b.value);
			if (aDisabled && !bDisabled) return 1;
			if (!aDisabled && bDisabled) return -1;
			return 0;
		});

	return (
		<div className={cn('w-full')}>
			{_label && <label className={cn('block text-sm font-medium text-zinc-950 mb-1')}>{_label}</label>}
			<MultiSelect
				options={options}
				onValueChange={(selectedValues) => {
					const selectedFeatures = featuresData.items.filter((feature: Feature) => selectedValues.includes(feature.id));
					onChange(selectedFeatures);
				}}
				defaultValue={values}
				placeholder={placeholder}
				maxCount={1}
				className={cn('h-10', className)}
			/>
			{description && <p className='text-sm text-muted-foreground mt-1'>{description}</p>}
			{error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
		</div>
	);
};

export default FeatureMultiSelect;
