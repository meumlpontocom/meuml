from flask import request, redirect
from flask_jwt_simple import get_jwt_identity, jwt_required
from libs.actions.actions import Actions
from libs.decorator.prepare import prepare

class ProcessesActions(Actions):
    @jwt_required
    @prepare
    def processes(self):
        method = request.method

        if method == 'GET':
            response = []

            try:
                query = """
                    SELECT p.id, p.account_id, p.date_created, p.tool_id, p.items_total, sum(CASE WHEN pit.status = 2 THEN 0 ELSE 1 end) as items_finished,
                            p.date_finished,
                            COALESCE(a.name, 'Não identificada') AS name, a.external_nickname, COALESCE(t.name, '') AS tool_name
                    FROM meuml.processes p, meuml.process_items pit, meuml.accounts a, meuml.tools t
                    WHERE pit.process_id = p.id
                        AND p.date_created >= CURRENT_DATE
                        AND pit.date_created >= CURRENT_DATE
                        AND p.account_id = a.id
                        AND p.tool_id = t.id
                        AND pit.process_id = p.id
                        AND p.tool_id not in (72)
                        AND p.user_id = :user_id
                    GROUP BY p.id, p.account_id , p.date_created , p.tool_id , p.date_finished, a."name", a.external_nickname, t."name"
                    ORDER BY p.id DESC FETCH NEXT 30 ROWS only
                """
                processes = self.fetchall(query, {'user_id': self.user["id"]})

            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Erro ao localizar processos.',
                    'status': 'error',
                }, 200)

            if len(processes) == 0:
                return self.return_success('Nenhum processo localizado',[])

            ids = ', '.join(str(row['id']) for row in processes)
            query = f"""
                SELECT p_i.process_id, p_i.tool_id, p_i.item_external_id as item_id, p_i.status, p_i.message, COALESCE(tl.name, 'Erro ao identificar Tool') AS tool_name
                FROM meuml.process_items p_i 
                LEFT JOIN meuml.tools tl ON tl.id = p_i.tool_id 
                WHERE user_id = :user_id AND process_id IN ({ids})
            """
            values = {'user_id': self.user["id"]}
            items_list = self.fetchall(query, values)
            
            items_result = {}
            for item in items_list:
                process_id = item.pop('process_id')
                if process_id in items_result:
                    items_result[process_id].append(item)
                else:
                    items_result[process_id] = [item]

            for row in processes:
                data = {}
                data['id'] = row['account_id']
                data['nickname'] = row['external_nickname']
                data['account_name'] = row['name']
                data['date_created'] = row['date_created']
                data['item_finished'] = row['items_finished']
                data['date_finished'] = row['date_finished']
                data['tool_name'] = row['tool_name']
                data['item_total'] = row['items_total']

                data['process_items'] = items_result.pop(row['id'], [])

                response.append(data)

            return self.return_success('Processos localizados', response)


    @jwt_required
    @prepare
    def new_processes(self):
        method = request.method

        if method == 'GET':
            try:
                query = """
                    SELECT p.id AS process_id, p.account_id AS id, p.date_created::timestamp without time zone at time zone 'utc+3' AS date_created,
                            p.items_total AS item_total, sum(CASE WHEN pit.id IS NULL OR pit.status = 2 THEN 0 ELSE 1 end) AS item_finished,
                            sum(CASE WHEN pit.status = 1 THEN 1 ELSE 0 end) AS successes, 
                            p.date_finished::timestamp without time zone at time zone 'utc+3' AS date_finished,
                            COALESCE(a.name, spa.name, u.name) AS account_name, COALESCE(a.external_nickname, spa.shop_name, u.name) AS nickname,
                            COALESCE(t.name, '') AS tool_name, COALESCE(p.platform, 'MeuML') as platform
                    FROM meuml.tools t, meuml.processes p
                    JOIN meuml.users u ON p.user_id = u.id
                    LEFT JOIN meuml.process_items pit ON pit.process_id = p.id AND pit.date_created >= CURRENT_DATE
                    LEFT JOIN meuml.accounts a ON a.id = p.account_id AND p.platform='ML'
                    LEFT JOIN shopee.accounts spa ON spa.id = p.account_id AND p.platform='SP'
                    WHERE p.date_created >= CURRENT_DATE
                        AND p.tool_id = t.id
                        AND p.tool_id not in (72)
                        AND p.user_id = :user_id
                    GROUP BY p.id, p.account_id, p.date_created, p.tool_id, p.date_finished, account_name, nickname, t."name", a.id, spa.id
                    ORDER BY p.id DESC FETCH NEXT 30 ROWS ONLY
                """
                processes = self.fetchall(query, {'user_id': self.user["id"]})

            except Exception as e:
                print(e)
                self.abort_json({
                    'message': f'Erro ao localizar processos.',
                    'status': 'error',
                }, 200)

            if len(processes) == 0:
                return self.return_success('Nenhum processo localizado',[])

            return self.return_success('Processos localizados', processes)


    @jwt_required
    @prepare
    def process_items(self, process_id):
        response = []

        query = f"""
            SELECT p_i.id, p_i.process_id, p_i.item_external_id as item_id, p_i.status, p_i.message
            FROM meuml.process_items p_i 
            WHERE process_id = :process_id
        """
        values = {'process_id': process_id}
        response = self.fetchall(query, values)      

        return self.return_success(data=response)

    @jwt_required
    @prepare
    def list_replications_history(self):
        page = int(request.args.get("page", '1'))
        page_size = 50

        offset = (page - 1) * page_size

        try:
            list_processes_query = """
                SELECT p.id AS process_id, p.account_id AS id, p.date_created::timestamp without time zone at time zone 'utc+3' AS date_created,
                    p.items_total AS item_total, sum(CASE WHEN pit.id IS NULL OR pit.status = 2 THEN 0 ELSE 1 end) AS item_finished,
                    sum(CASE WHEN pit.status = 1 THEN 1 ELSE 0 end) AS successes, 
                    p.date_finished::timestamp without time zone at time zone 'utc+3' AS date_finished,
                    COALESCE(a.name, spa.name, u.name) AS account_name, COALESCE(a.external_nickname, spa.shop_name, u.name) AS nickname,
                    COALESCE(t.name, '') AS tool_name, COALESCE(p.platform, 'MeuML') as platform
                FROM meuml.tools t, meuml.processes p
                JOIN meuml.users u ON p.user_id = u.id
                LEFT JOIN meuml.process_items pit ON pit.process_id = p.id
                LEFT JOIN meuml.accounts a ON a.id = p.account_id AND p.platform='ML'
                LEFT JOIN shopee.accounts spa ON spa.id = p.account_id AND p.platform='SP'
                WHERE p.tool_id = t.id
                    AND p.tool_id in (44, 55, 90, 92)
                    AND p.user_id = :user_id
                GROUP BY p.id, p.account_id, p.date_created, p.tool_id, p.date_finished, account_name, nickname, t."name", a.id, spa.id
                ORDER BY p.id DESC
                LIMIT :limit
                OFFSET :offset
            """

            processes = self.fetchall(list_processes_query, {'user_id': self.user["id"], 'limit': page_size, 'offset': offset})

            count_total_query = """
                SELECT
                    COUNT (*)
                FROM
                    meuml.processes p 
                WHERE 
                    p.user_id = :user_id
                    AND p.tool_id IN (44, 55, 90, 92);
            """

            total_count = self.fetchone(count_total_query, {'user_id': self.user["id"]})
            total_count = int(total_count.get('count', 0))

            params_for_meta = {
                'limit': 50,
                'offset': offset,
                'page': page
            }
            
            meta = self.generate_meta(params_for_meta, total_count)

        except Exception as e:
            print(e)
            self.abort_json({
                'message': f'Erro ao listar replicações.',
                'status': 'error',
            }, 200)

        if len(processes) == 0:
            return self.return_success('Nenhuma replicação encontrada',[], meta=meta)

        return self.return_success('Replicações encontradas', processes, meta=meta)