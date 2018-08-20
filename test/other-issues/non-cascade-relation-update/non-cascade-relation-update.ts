import { Connection } from "../../../src/connection/Connection";
import { createTestingConnections, closeTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Master } from "./entity/Master";
import { Slave } from "./entity/Slave";
import { expect } from "chai";
import { MasterMitigated } from "./entity/MasterMitigated";


describe("other-issues > non-cascade-update", () => {


    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"]
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should do nothing when there are no changes in master entity", 
    () => Promise.all(connections.map(async connection => {

        let masterId: number;

        {
            // Setup DB
            const master = new Master();
            master.masterContent = "MASTER CONTENT";
            master.slave = new Slave();
            master.slave.content = "SLAVE CONTENT";
    
            await connection.manager.save(master.slave);
            await connection.manager.save(master);

            masterId = master.id;
        }


        {
            // Receive HTTP PUT
            const payload = {
                id: 0,
                masterContent: "MASTER CONTENT",
                slave: {
                    content: "slave content",
                }
            };

            payload.id = masterId;

            const response = await connection
                .getRepository(Master)
                .save(payload);

            expect(response).to.be.deep.equal({
                id: masterId,
                masterContent: "MASTER CONTENT",
                slave: {
                    content: "slave content",
                }
            });
        }

    })));

    it("should mitigate and do unwanted update", 
    () => Promise.all(connections.map(async connection => {

        let masterId: number;
        let slaveId: number;

        {
            // Setup DB
            const master = new MasterMitigated();
            master.masterContent = "MASTER CONTENT";
            master.slave = new Slave();
            master.slave.content = "SLAVE CONTENT";
    
            await connection.manager.save(master.slave);
            await connection.manager.save(master);

            masterId = master.id;
            slaveId = master.slave.id;
        }


        {
            // Receive HTTP PUT
            const payload = {
                id: 0,
                masterContent: "MASTER CONTENT",
                slave: {
                    content: "slave content",
                }
            };

            payload.id = masterId;

            const response = await connection
            .getRepository(MasterMitigated)
            .save(payload);

            expect(response).to.be.deep.equal({
                id: masterId,
                masterContent: "MASTER CONTENT",
                slave: {
                    id: slaveId,
                    content: "slave content",
                }
            });

        }

    })));

});
