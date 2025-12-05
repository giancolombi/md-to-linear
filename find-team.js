import { LinearClient } from '@linear/sdk';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

async function findTeams() {
  const apiKey = process.env.LINEAR_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('Error: LINEAR_API_KEY must be set in .env file'));
    process.exit(1);
  }
  
  const client = new LinearClient({ apiKey });
  
  try {
    console.log(chalk.blue('\nFetching your Linear teams...\n'));
    
    const teams = await client.teams();
    
    for (const team of teams.nodes) {
      console.log(chalk.green(`Team: ${chalk.bold(team.name)}`));
      console.log(chalk.yellow(`  Key: ${team.key}`));
      console.log(chalk.cyan(`  ID: ${team.id}`));
      console.log('');
    }
    
    console.log(chalk.gray('\nCopy the ID for the team you want to use and add it to your .env file as LINEAR_TEAM_ID\n'));
    
  } catch (error) {
    console.error(chalk.red('Error:', error.message));
  }
}

findTeams();