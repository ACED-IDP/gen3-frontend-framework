import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  MantineProvider,
  Container,
  Text,
  Image,
  LoadingOverlay,
  Button,
} from '@mantine/core';
import ReactECharts from 'echarts-for-react';

import {
  NavPageLayout,
  NavPageLayoutProps,
  ProtectedContent,
  ErrorCard,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

import { fieldNameToTitle, useGeneralGQLQuery } from '@gen3/core';
import { title } from 'process';

////////////////
// INTERFACES //
////////////////
interface SamplePageProps {
  headerProps: any;
  footerProps: any;
}

interface HistogramData {
  key: string;
  count: number;
}

interface Observation {
  [key: string]: {
    histogram: HistogramData[];
    file?: File;
    _cardinalityCount?: number;
  };
}

interface File {
  _totalCount: number;
}

interface QueryResponse {
  data?: Record<string, Observation[]>;
  countsProperty?: string;
}

/////////////
// HELPERS //
/////////////
const isQueryResponse = (obj: any): obj is QueryResponse => {
  return (
    typeof obj === 'object' &&
    (obj.data === undefined || typeof obj.data === 'object')
  );
};

const extractData = (
  data: QueryResponse,
  countsProperty: string,
  returnType: 'histogram' | 'totalCounts',
): HistogramData[] | number => {
  if (!data || !data.data || !data.data._aggregation || !countsProperty) {
    return returnType === 'histogram' ? [] : 0;
  }

  const allObservations = Object.values(data.data._aggregation).flat();
  const targetObservation = allObservations.find(
    (observation) => observation[countsProperty],
  );

  if (!targetObservation) {
    return returnType === 'histogram' ? [] : 0;
  }

  if (returnType === 'histogram') {
    return Array.isArray(targetObservation[countsProperty].histogram)
      ? targetObservation[countsProperty].histogram.slice(0, 20)
      : [];
  } else if (targetObservation && targetObservation[countsProperty]) {
    const cardinalityCount =
      targetObservation[countsProperty]!._cardinalityCount;
    if (typeof cardinalityCount === 'number') {
      return cardinalityCount;
    }
  }
  return 0;
};

const summaryCountsQuery = (resourceType: string, countsProperty: string) => {
    const summary_counts_query = {
      query: `query ($filter: JSON){
      _aggregation {
        ${resourceType}(filter: $filter, accessibility: all) {
          ${countsProperty} {
            _cardinalityCount
            }
          }
        }
      }`,
      variables: {
        filter: {
          AND: [
            {
              IN: {
                project_id: ['cbds-smmart_labkey_demo'],
              },
            },
          ],
        },
      },
    };
    return summary_counts_query;
  };

const countsQuery = (resourceType: string, countsProperty: string) => {
  const props_query = {
    query: `query ($filter: JSON) {
      _aggregation{
        ${resourceType}(filter: $filter accessibility:all) {
          ${countsProperty}{
            histogram {
              key
              count
            }
          }
        }
      }
    }`,
    variables: {
      filter: {
        AND: [
          {
            IN: {
              project_id: ['cbds-smmart_labkey_demo'],
            },
          },
        ],
      },
    },
  };
  return props_query;
};

const useCountsFromField = (resourceType: string, countsProperty: string) => {
  const { data, isLoading, isError } = useGeneralGQLQuery(
    summaryCountsQuery(resourceType, countsProperty),
  );
  const totalCountsData = isQueryResponse(data)
    ? extractData(data, countsProperty, 'totalCounts')
    : 0;
  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }
  return isLoading ? (
    <div>loading...</div>
  ) : (
    <div className="text-2xl font-bold">
      {typeof totalCountsData === 'number' ? (
        totalCountsData
      ) : (
        <>{'missing data'}</>
      )}
    </div>
  );
};

const SummaryCounts = (countsProperty: string) => {
  const { data, isLoading, isError } = useGeneralGQLQuery(
    summaryCountsQuery('Observation', countsProperty),
  );
  const totalCountsData = isQueryResponse(data)
    ? extractData(data, countsProperty, 'totalCounts')
    : 0;
  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }
  return isLoading ? (
    <div>loading...</div>
  ) : (
    <div className="text-2xl font-bold">
      {typeof totalCountsData === 'number' ? (
        totalCountsData
      ) : (
        <>{'missing data'}</>
      )}
    </div>
  );
};

const ChartFromField = (resourceType: string, countsProperty: string) => {
  const { data, isLoading, isError } = useGeneralGQLQuery(
    countsQuery(resourceType, countsProperty),
  );
  const queryData = isQueryResponse(data)
    ? extractData(data, countsProperty, 'histogram')
    : [];
  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }
  
  // sort by counts descending
  if (Array.isArray(queryData)){
    queryData.sort((a, b) => a.count - b.count);
  }

  // setup echart configs
  const option = {
    title: {
      text: fieldNameToTitle(countsProperty),
      right: 50,
    },
    yAxis: {
      type: 'category',
      data: Array.isArray(queryData) ? queryData.map((item) => item.key) : [],
      axisLabel: {
        interval: 0,
      },
    },
    xAxis: {
      type: 'value',
    },
    grid: {
      containLabel: true,
    },
    series: [
      {
        data: Array.isArray(queryData)
          ? queryData.map((item) => item.count)
          : [],
        type: 'bar',
        barCategoryGap: '50%',
      },
    ],
  };
  const chart = (
    <div className="w-full h-full">
      <LoadingOverlay visible={isLoading} />
      <ReactECharts
        option={option}
        style={{ height: '100%', minHeight: '500px' }}
      />
    </div>
  );
  return chart;
};


///////////////
// COMPONENT //
///////////////
const HorizontalBarChart = ({ headerProps, footerProps }: SamplePageProps) => {
  const router = useRouter();

  // TODO: refactor out into a config
  const chartResourceType = ['file', 'specimen'];
  const chartFields = ['protocol_library_type', 'biopsy_anatomical_location'];
  const numChartCols = chartFields.length <= 3 ? chartFields.length : 3;
  const countsFields = ['patient_id', 'specimen_identifier', 'specimen_collection_concept', 'clinical_trials'];
  const countsTitles = ['Patients', 'Specimens', 'Cancers', 'Clinical Trials'];


  return (
      <NavPageLayout headerProps={headerProps} footerProps={footerProps}>
        <MantineProvider withGlobalStyles>
          <div className="pt-5">
            <div className="bg-cbds-primary pt-[1.5%] pb-[1.5%]">
              <Container className="bg-cbds-monoprimary text-center">
                <span className="flex items-center space-x-4">
                  <div className="p-5 flex-shrink-0">
                    <Image src={'/icons/SMMART.svg'} alt={'logo'} />
                  </div>
                  <Text className="whitespace-nowrap text-center text-white text-5xl font-bold">
                    SMMART Clinical Trials Platform
                  </Text>
                </span>
              </Container>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="p-10">
                <h1 className="prose sm:prose-base 2xl:prose-lg mb-5 !mt-0">
                  Overview of SMMART and datasets, what can be found in this
                  project
                </h1>
                <Button
                  onClick={() => {
                    router.push('/Explorer');
                  }}
                  className="bg-cbds-monoprimary text-white py-2 px-4 rounded"
                >
                  Explore
                </Button>
              </div>
              <div className={`col-span-${numChartCols} grid grid-cols-${numChartCols} gap-2`}>
                {chartResourceType.map((resourceType, i) => ChartFromField(resourceType, chartFields[i]))}
              </div>
            </div>
            <div className="text-center mx-auto bg-gray-200 py-5">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  {useCountsFromField('specimen', 'id')}
                  <div className="text-sm">Specimens</div>
                </div>
                <div className="text-center">
                  {useCountsFromField('file', 'id')}
                  <div className="text-sm">Files</div>
                </div>
                <div className="text-center">
                  {useCountsFromField('researchsubject', 'id')}
                  <div className="text-sm">Research Subjects</div>
                </div>
              {/* {countsFields.map((field, i) => {
                return (
                  <div className="text-center">
                    {countsFromField(field)}
                    <div className="text-sm">{countsTitles[i]}</div>
                  </div>
                )
              })} */}
              </div>
            </div>
          </div>
        </MantineProvider>
      </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default HorizontalBarChart;
