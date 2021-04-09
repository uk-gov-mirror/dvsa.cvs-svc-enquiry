import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import DatabaseService from '../interfaces/DatabaseService';
import ResultsEvent from '../interfaces/ResultsEvent';
import { getResultsByVrm, getResultsByVin, getResultsByTestId } from './databaseService';

export default (
  event: ResultsEvent,
): ((databaseService: DatabaseService, event: ResultsEvent) => Promise<[RowDataPacket[], FieldPacket[]]>
  ) => {
  if (event.vinNumber) {
    console.info('Using getResultsByVin');

    return getResultsByVin;
  }
  if (event.VehicleRegMark) {
    console.info('Using getResultsByVrm');

    return getResultsByVrm;
  }

  console.info('Using getResultsByTestId');
  return getResultsByTestId;
};
